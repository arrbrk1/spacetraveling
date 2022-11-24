import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { BsCalendar4, BsFillPersonFill, BsClock } from 'react-icons/bs';
import { RichText } from 'prismic-dom';
import { PrismicDocument } from '@prismicio/types';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Content {
  heading: string;
  body: string;
}

interface Post {
  first_publication_date: string | null;
  readingTime: number;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: Content[];
  };
}

interface PostProps {
  post: Post;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <div className={styles.loading}>Carregando...</div>;
  }
  return (
    <>
      <Head>
        <title>Home | Spacetraveling</title>
      </Head>

      <main className={commonStyles.layout}>
        <article className={styles.container}>
          <img src={post.data.banner.url} alt={post.data.title} />

          <h1>{post.data.title}</h1>

          <div>
            <time>
              <BsCalendar4 />
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>

            <span>
              <BsFillPersonFill /> {post.data.author}
            </span>

            <time>
              <BsClock />
              {`${Math.ceil(
                post.data.content.reduce(
                  (acumulador: number, elements: Content) => {
                    const headingLength = elements.heading.split(' ').length;
                    const bodyLength = RichText.asText(elements.body).split(
                      ' '
                    ).length;

                    const readingTime = headingLength + bodyLength + acumulador;

                    return readingTime;
                  },
                  0
                ) / 200
              )} min`}
            </time>
          </div>

          {post.data.content.map(content => (
            <div key={content.heading}>
              <h2>{content.heading}</h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </div>
          ))}
        </article>
      </main>
    </>
  );
};

export default Post;

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const res = await prismic.getByType<PrismicDocument>('posts');

  const paths = res.results.map(r => {
    return { params: { slug: r.uid } };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const res = await prismic.getByUID('posts', String(params.slug), {});

  return { props: { post: res } };
};
