import { Outlet,Navigate } from "react-router-dom";
import Footer from './Footer';
import Navbar from './Navbar';
import Sidebar from './sidebar';
import Switcher from './Switcher';

const Layout = () =>{

    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        return <Navigate to="/" replace />;
    }
    return(
        <>
            <div className="dark:bg-slate-900 bg-gray-50">
                <div class="absolute w-full bg-blue-500 dark:hidden min-h-75"></div>
                <Sidebar/>
                <main class="relative h-full max-h-screen transition-all duration-200 ease-in-out xl:ml-68 rounded-xl">
                    <Navbar/>
                    <Outlet/>
                    <Footer/>
                </main>
                {/* <Switcher/> */}
            </div>
        </>
    )
}

export default Layout;