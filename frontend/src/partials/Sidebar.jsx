import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";


const Sidebar = () =>{
   const [currentUser, setCurrentUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get("http://localhost:3000/users/check-auth", {
                    withCredentials: true,
                });
                setCurrentUser(response.data.data?.user || null);
            } catch (error) {
                setCurrentUser(null);
            } finally {
                setAuthLoading(false);
            }
        };
        checkAuth();
    }, []);
    return(
        <>
{/* sidenav  */}
<aside className="fixed inset-y-0 flex-wrap items-center justify-between block w-full p-0 my-4 overflow-y-auto antialiased transition-transform duration-200 -translate-x-full bg-white border-0 shadow-xl dark:shadow-none dark:bg-slate-850 max-w-64 ease-nav-brand z-990 xl:ml-6 rounded-2xl xl:left-0 xl:translate-x-0" aria-expanded="false">
  <div className="h-19">
    <a className="block px-8 py-6 m-0 text-sm whitespace-nowrap dark:text-white text-slate-700" href="https://demos.creative-tim.com/argon-dashboard-tailwind/pages/dashboard.html" target="_blank">
      <img src="./assets/img/logo-ct-dark.png" className="inline h-full max-w-full transition-all duration-200 dark:hidden ease-nav-brand max-h-8" alt="main_logo" />
      <img src="./assets/img/logo-ct.png" className="hidden h-full max-w-full transition-all duration-200 dark:inline ease-nav-brand max-h-8" alt="main_logo" />
      <span className="ml-1 font-semibold transition-all duration-200 ease-nav-brand">Argon Dashboard 2</span>
    </a>
  </div>
  <hr className="h-px mt-0 bg-transparent bg-gradient-to-r from-transparent via-black/40 to-transparent dark:bg-gradient-to-r dark:from-transparent dark:via-white dark:to-transparent" />
  <div className="items-center block w-auto max-h-screen overflow-auto h-sidenav grow basis-full">
    <ul className="flex flex-col pl-0 mb-0">
      <li className="mt-0.5 w-full">
        <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `py-2.7 text-sm ease-nav-brand my-0 mx-2 flex items-center whitespace-nowrap px-4 transition-colors rounded-lg ${
                isActive
                  ? 'bg-blue-500/20 bg-blue-500/13 text-blue-700 font-semibold'
                  : 'text-slate-700 dark:text-white dark:opacity-80'
              }`
            }
          >
            <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg text-center xl:p-2.5">
              <i className="ni ni-tv-2 relative top-0 text-sm leading-normal text-blue-500" />
            </div>
            <span className="ml-1 duration-300 opacity-100 ease">Dashboard</span>
          </NavLink>
      </li>
      {currentUser?.role === 'admin' && (
                            <li className="mt-0.5 w-full">
                                <NavLink
                                    to="/user-list"
                                    className={({ isActive }) =>
                                        `py-2.7 text-sm ease-nav-brand my-0 mx-2 flex items-center whitespace-nowrap px-4 transition-colors rounded-lg ${
                                            isActive
                                                ? 'bg-blue-500/20 bg-blue-500/13 text-blue-700 font-semibold'
                                                : 'text-slate-700 dark:text-white dark:opacity-80'
                                        }`
                                    }
                                >
                                    <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg text-center xl:p-2.5">
                                        <i className="las la-users relative top-0 text-xl leading-normal text-purple-500" />
                                    </div>
                                    <span className="ml-1 duration-300 opacity-100 ease">Utilisateurs</span>
                                </NavLink>
                            </li>
                        )}

      <li className="mt-0.5 w-full">
        <NavLink
            to="/station-list"
            className={({ isActive }) =>
              `py-2.7 text-sm ease-nav-brand my-0 mx-2 flex items-center whitespace-nowrap px-4 transition-colors rounded-lg ${
                isActive
                  ? 'bg-blue-500/20 bg-blue-500/13 text-orange-600 font-semibold'
                  : 'text-slate-700 dark:text-white dark:opacity-80'
              }`
            }
          >
            <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg text-center xl:p-2.5">
              <i className="las la-broadcast-tower relative top-0 text-xl leading-normal text-orange-500"></i>
            </div>
            <span className="ml-1 duration-300 opacity-100 ease">Stations de Base</span>
          </NavLink>
      </li>
      <li className="mt-0.5 w-full">
        <NavLink
            to="/antenne-list"
            className={({ isActive }) =>
              `py-2.7 text-sm ease-nav-brand my-0 mx-2 flex items-center whitespace-nowrap px-4 transition-colors rounded-lg ${
                isActive
                  ? 'bg-blue-500/20 bg-blue-500/13 text-blue-700 font-semibold'
                  : 'text-slate-700 dark:text-white dark:opacity-80'
              }`
            }
          >
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-center fill-current stroke-0 text-center xl:p-2.5">
            <i class="las la-wifi relative top-0 text-xl leading-normal text-emerald-500"></i>
          </div>
          <span className="ml-1 duration-300 opacity-100 pointer-events-none ease">Antennes</span>
        </NavLink>
      </li>
      <li className="mt-0.5 w-full">
        <NavLink
            to="/transmission-list"
            className={({ isActive }) =>
              `py-2.7 text-sm ease-nav-brand my-0 mx-2 flex items-center whitespace-nowrap px-4 transition-colors rounded-lg ${
                isActive
                  ? 'bg-blue-500/20 bg-blue-500/13 text-blue-700 font-semibold'
                  : 'text-slate-700 dark:text-white dark:opacity-80'
              }`
            }
          >
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-center stroke-0 text-center xl:p-2.5">
            <i class="relative top-0 text-xl leading-normal text-cyan-500 las la-signal"></i>
          </div>
          <span className="ml-1 duration-300 opacity-100 pointer-events-none ease">Transmissions</span>
        </NavLink>
      </li>
      <li className="mt-0.5 w-full">
        <NavLink
            to="/derangement-list"
            className={({ isActive }) =>
              `py-2.7 text-sm ease-nav-brand my-0 mx-2 flex items-center whitespace-nowrap px-4 transition-colors rounded-lg ${
                isActive
                  ? 'bg-blue-500/20 bg-blue-500/13 text-blue-700 font-semibold'
                  : 'text-slate-700 dark:text-white dark:opacity-80'
              }`
            }
          >
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-center stroke-0 text-center xl:p-2.5">
            <i className="relative top-0 text-xl leading-normal text-red-600 <i las la-exclamation-triangle" />
          </div>
          <span className="ml-1 duration-300 opacity-100 pointer-events-none ease">Dérangement</span>
        </NavLink>
      </li>
      <li className="mt-0.5 w-full">
        <NavLink
            to="/ticket-list"
            className={({ isActive }) =>
              `py-2.7 text-sm ease-nav-brand my-0 mx-2 flex items-center whitespace-nowrap px-4 transition-colors rounded-lg ${
                isActive
                  ? 'bg-blue-500/20 bg-blue-500/13 text-blue-700 font-semibold'
                  : 'text-slate-700 dark:text-white dark:opacity-80'
              }`
            }
          >
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-center stroke-0 text-center xl:p-2.5">
            <i className="relative top-0 text-xl leading-normal las la-ticket-alt" style={{ color: '#9b5de5' }}/>
          </div>
          <span className="ml-1 duration-300 opacity-100 pointer-events-none ease">Tickets</span>
        </NavLink>
      </li>
      <li className="w-full mt-4">
        <h6 className="pl-6 ml-2 text-xs font-bold leading-tight uppercase dark:text-white opacity-60">Account pages</h6>
      </li>
      <li className="mt-0.5 w-full">
        <a className=" dark:text-white dark:opacity-80 py-2.7 text-sm ease-nav-brand my-0 mx-2 flex items-center whitespace-nowrap px-4 transition-colors" href="./pages/profile.html">
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-center stroke-0 text-center xl:p-2.5">
            <i className="relative top-0 text-sm leading-normal text-slate-700 ni ni-single-02" />
          </div>
          <span className="ml-1 duration-300 opacity-100 pointer-events-none ease">Profile</span>
        </a>
      </li>
      <li className="mt-0.5 w-full">
        <a className=" dark:text-white dark:opacity-80 py-2.7 text-sm ease-nav-brand my-0 mx-2 flex items-center whitespace-nowrap px-4 transition-colors" href="./pages/sign-in.html">
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-center stroke-0 text-center xl:p-2.5">
            <i className="relative top-0 text-sm leading-normal text-orange-500 ni ni-single-copy-04" />
          </div>
          <span className="ml-1 duration-300 opacity-100 pointer-events-none ease">Sign In</span>
        </a>
      </li>
      <li className="mt-0.5 w-full">
        <a className=" dark:text-white dark:opacity-80 py-2.7 text-sm ease-nav-brand my-0 mx-2 flex items-center whitespace-nowrap px-4 transition-colors" href="./pages/sign-up.html">
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-center stroke-0 text-center xl:p-2.5">
            <i className="relative top-0 text-sm leading-normal text-cyan-500 ni ni-collection" />
          </div>
          <span className="ml-1 duration-300 opacity-100 pointer-events-none ease">Sign Up</span>
        </a>
      </li>
    </ul>
  </div>
  <div className="mx-4">
    {/* load phantom colors for card after: */}
    <p className="invisible hidden text-gray-800 text-red-500 text-red-600 text-blue-500 bg-gray-500/30 bg-cyan-500/30 bg-emerald-500/30 bg-orange-500/30 bg-red-500/30 after:bg-gradient-to-tl after:from-zinc-800 after:to-zinc-700 dark:bg-gradient-to-tl dark:from-slate-750 dark:to-gray-850 after:from-blue-700 after:to-cyan-500 after:from-orange-500 after:to-yellow-500 after:from-green-600 after:to-lime-400 after:from-red-600 after:to-orange-600 after:from-slate-600 after:to-slate-300 text-emerald-500 text-cyan-500 text-slate-400" />
    <div className="relative flex flex-col min-w-0 break-words bg-transparent border-0 shadow-none rounded-2xl bg-clip-border" sidenav-card>
      <img className="w-1/2 mx-auto" src="./assets/img/illustrations/icon-documentation.svg" alt="sidebar illustrations" />
      <div className="flex-auto w-full p-4 pt-0 text-center">
        <div className="transition-all duration-200 ease-nav-brand">
          <h6 className="mb-0 dark:text-white text-slate-700">Need help?</h6>
          <p className="mb-0 text-xs font-semibold leading-tight dark:text-white dark:opacity-60">Please check our docs</p>
        </div>
      </div>
    </div>
    <a href="https://www.creative-tim.com/learning-lab/tailwind/html/quick-start/argon-dashboard/" target="_blank" className="inline-block w-full px-8 py-2 mb-4 text-xs font-bold leading-normal text-center text-white capitalize transition-all ease-in rounded-lg shadow-md bg-slate-700 bg-150 hover:shadow-xs hover:-translate-y-px">Documentation</a>
    {/* pro btn  */}
    <a className="inline-block w-full px-8 py-2 text-xs font-bold leading-normal text-center text-white align-middle transition-all ease-in bg-blue-500 border-0 rounded-lg shadow-md select-none bg-150 bg-x-25 hover:shadow-xs hover:-translate-y-px" href="https://www.creative-tim.com/product/argon-dashboard-pro-tailwind?ref=sidebarfree" target="_blank">Upgrade to pro</a>
  </div>
</aside>
{/* end sidenav */}

        </>
    )
}

export default Sidebar;