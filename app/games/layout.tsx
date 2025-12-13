import Footer from '@/components/layout/footer/footer';
import Header from '@/components/layout/header';

// 1. Define an interface for the props, extending React.PropsWithChildren
interface LayoutProps extends React.PropsWithChildren {}

// 2. Use React.FC<LayoutProps> and destructure the props
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <Header />
      <div className='my-20'>{children}</div>
      <Footer />
    </div>
  );
};

export default Layout; // Use 'const' definition above and export here
