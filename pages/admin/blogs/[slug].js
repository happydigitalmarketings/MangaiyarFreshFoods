import Head from 'next/head';
import { useRouter } from 'next/router';
import { verifyToken } from '../../../lib/auth';
import BlogForm from '../../../components/BlogForm';
import AdminLayout from '../../../components/AdminLayout';

export default function EditBlogPost({ user }) {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <AdminLayout user={user}>
      <Head>
        <title>Edit Blog Post | Minukki Admin</title>
      </Head>
      <BlogForm user={user} postId={slug} />
    </AdminLayout>
  );
}

export async function getServerSideProps({ req }) {
  try {
    const cookies = req.headers.cookie || '';
    const token = cookies.split('token=')[1] ? cookies.split('token=')[1].split(';')[0] : null;
    const user = token ? await verifyToken(token) : null;
    if (!user || user.role !== 'admin') {
      return {
        redirect: {
          destination: '/admin/login',
          permanent: false,
        },
      };
    }
    // Return a JSON-serializable user object (avoid Mongoose document)
    const safeUser = {
      id: user._id ? String(user._id) : null,
      name: typeof user.name === 'string' ? user.name : (user.name?.name || ''),
      email: user.email || '',
      role: user.role || '',
    };
    return { props: { user: safeUser } };
  } catch (err) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }
}