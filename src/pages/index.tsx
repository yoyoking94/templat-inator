import dynamic from 'next/dynamic';
import Head from 'next/head';
import Header from "@/components/common/header/Header";
import Main from "@/components/common/main/Main";

const CustomCursor = dynamic(
  () => import("@/components/common/customcursor/CustomCursor"),
  { ssr: false }
);

export default function Home() {
  return (
    <>
      <Head>
        <title>Yovish MOONESAMY - Portfolio | Développeur Web</title>
        <meta name="description" content="Découvrez mes projets et compétences en développement web. Alternant passionné par Next.js, React et TypeScript." />
      </Head>
      {/* ✅ Container principal sans scroll */}
      <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <CustomCursor />
        <Header />
        <Main />
        {/* Footer supprimé si tu veux, ou garde-le dans la nav */}
      </div>
    </>
  );
}
