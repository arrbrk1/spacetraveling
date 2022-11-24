import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { BsCalendar4, BsFillPersonFill } from 'react-icons/bs';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const Home: NextPage<HomeProps> = ({ postsPagination }) => {
  const [nextPage, setNextPage] = useState('');
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [hasMore, setHasMore] = useState(!!postsPagination.next_page);

  async function handleNewPagination(): Promise<void> {
    try {
      if (!postsPagination.next_page) {
        setHasMore(false);
        return;
      }

      if (nextPage !== '') {
        const result = await fetch(nextPage);

        result.json().then(res => {
          setPosts(res.results);

          if (!res.next_page) {
            setHasMore(false);
          }
        });
      } else {
        const result = await fetch(postsPagination.next_page);

        result.json().then(res => {
          setPosts(res.results);

          if (!res.next_page) {
            setHasMore(false);
            return;
          }

          setNextPage(res.next_page);
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Head>
        <title>Home | Spacetraveling</title>
      </Head>

      <main className={commonStyles.layout}>
        {posts.map(post => (
          <article key={post.uid} className={styles.container}>
            <Link href={`/post/${post.uid}`} passHref>
              <a>
                <strong>{post.data.title}</strong>

                <p>{post.data.subtitle}</p>

                <time>
                  <BsCalendar4 />
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
                <span>
                  <BsFillPersonFill /> {post.data.author}
                </span>
              </a>
            </Link>
          </article>
        ))}

        {hasMore && (
          <button
            className={styles.btn}
            type="button"
            onClick={() => handleNewPagination()}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const { next_page, results } = await prismic.getByType('posts', {
    pageSize: 1,
  });

  return {
    props: {
      postsPagination: { next_page, results },
    },
  };
};
