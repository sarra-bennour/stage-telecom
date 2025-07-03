import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Fonction pour obtenir le titre et le breadcrumb en fonction de la route
    const getPageInfo = () => {
    switch (location.pathname) {
        case '/dashboard':
            return {
                breadcrumb: 'Dashboard',
                title: 'Dashboard',
                description: 'Vue d\'ensemble des statistiques et activités'
            };
        case '/station-list':
            return {
                breadcrumb: 'Stations',
                title: 'Liste des Stations',
                description: 'Gérez et consultez toutes les stations disponibles'
            };
        case '/antenne-list':
            return {
                breadcrumb: 'Antennes',
                title: 'Liste des Antennes',
                description: 'Gérez et consultez toutes les antennes disponibles'
            };
        case '/transmission-list':
            return {
                breadcrumb: 'Transmissions',
                title: 'Liste des Transmissions Physiques',
                description: 'Gérez les infrastructures de transmission physique (fibre, faisceau, HDSL)'
            };
        case '/derangement-list':
            return {
                breadcrumb: 'Dérangement',
                title: 'Liste des Dérangements',
                description: 'Consultez et gérez les dérangements (pannes) déclarées dans les stations'
            };
        case '/ticket-list':
            return {
                breadcrumb: 'Tickets',
                title: 'Liste des Tickets',
                description: 'Déclarez et suivez les tickets de panne'
            };
        default:
            return {
                breadcrumb: 'Dashboard',
                title: 'Dashboard',
                description: 'Vue d\'ensemble des statistiques et activités'
            };
        }
    };

    const { breadcrumb, title, description } = getPageInfo();

    const handleLogout = async () => {
        try {
        const response = await fetch('http://localhost:3000/users/logout', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            console.log('logout success')
            localStorage.removeItem('user'); 
            navigate('/');
        } else {
            console.error('Logout failed');
        }
        } catch (error) {
        console.error('Error during logout:', error);
        }
    };

    return(
        <>
            {/* Navbar */}
            <nav className="relative flex flex-wrap items-center justify-between px-0 py-2 mx-6 transition-all ease-in shadow-none duration-250 rounded-2xl lg:flex-nowrap lg:justify-start" navbar-main navbar-scroll="false">
                <div className="flex items-center justify-between w-full px-4 py-1 mx-auto flex-wrap-inherit">
                    <nav>
                        {/* breadcrumb */}
                        <ol className="flex flex-wrap pt-1 mr-12 bg-transparent rounded-lg sm:mr-16">
                            <li className="text-sm leading-normal">
                                <a className="text-white opacity-50" href="javascript:;">Pages</a>
                            </li>
                            <li className="text-sm pl-2 capitalize leading-normal text-white before:float-left before:pr-2 before:text-white before:content-['/']" aria-current="page">
                                {breadcrumb}
                            </li>
                        </ol>
                        <h4 className="mb-0 font-bold text-white capitalize">{title}</h4>
                        <p className="mb-0 text-sm text-white opacity-75 mt-1">{description}</p>
                    </nav>
            <div className="flex items-center mt-2 grow sm:mt-0 sm:mr-6 md:mr-0 lg:flex lg:basis-auto">
            <div className="flex items-center md:ml-auto md:pr-4">
                <div className="relative flex flex-wrap items-stretch w-full transition-all rounded-lg ease">
                <span className="text-sm ease leading-5.6 absolute z-50 -ml-px flex h-full items-center whitespace-nowrap rounded-lg rounded-tr-none rounded-br-none border border-r-0 border-transparent bg-transparent py-2 px-2.5 text-center font-normal text-slate-500 transition-all">
                    <i className="fas fa-search" />
                </span>
                <input type="text" className="pl-9 text-sm focus:shadow-primary-outline ease w-1/100 leading-5.6 relative -ml-px block min-w-0 flex-auto rounded-lg border border-solid border-gray-300 dark:bg-slate-850 dark:text-white bg-white bg-clip-padding py-2 pr-3 text-gray-700 transition-all placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:transition-shadow" placeholder="Type here..." />
                </div>
            </div>
            <ul className="flex flex-row justify-end pl-0 mb-0 list-none md-max:w-full">
                <li className="flex items-center">
                    <button 
                    onClick={handleLogout}
                    className="block px-0 py-2 text-sm font-semibold text-white transition-all ease-nav-brand"
                    >
                    <i className="fa fa-user sm:mr-1" />
                    <span className="hidden sm:inline">Log Out</span>
                    </button>
                </li>
                <li className="flex items-center pl-4 xl:hidden">
                <a href="javascript:;" className="block p-0 text-sm text-white transition-all ease-nav-brand" sidenav-trigger>
                    <div className="w-4.5 overflow-hidden">
                    <i className="ease mb-0.75 relative block h-0.5 rounded-sm bg-white transition-all" />
                    <i className="ease mb-0.75 relative block h-0.5 rounded-sm bg-white transition-all" />
                    <i className="ease relative block h-0.5 rounded-sm bg-white transition-all" />
                    </div>
                </a>
                </li>
                <li className="flex items-center px-4">
                <a href="javascript:;" className="p-0 text-sm text-white transition-all ease-nav-brand">
                    <i fixed-plugin-button-nav className="cursor-pointer fa fa-cog" />
                    {/* fixed-plugin-button-nav  */}
                </a>
                </li>
                {/* notifications */}
                <li className="relative flex items-center pr-2">
                <p className="hidden transform-dropdown-show" />
                <a href="javascript:;" className="block p-0 text-sm text-white transition-all ease-nav-brand" dropdown-trigger aria-expanded="false">
                    <i className="cursor-pointer fa fa-bell" />
                </a>
                <ul dropdown-menu className="text-sm transform-dropdown before:font-awesome before:leading-default before:duration-350 before:ease lg:shadow-3xl duration-250 min-w-44 before:sm:right-8 before:text-5.5 pointer-events-none absolute right-0 top-0 z-50 origin-top list-none rounded-lg border-0 border-solid border-transparent dark:shadow-dark-xl dark:bg-slate-850 bg-white bg-clip-padding px-2 py-4 text-left text-slate-500 opacity-0 transition-all before:absolute before:right-2 before:left-auto before:top-0 before:z-50 before:inline-block before:font-normal before:text-white before:antialiased before:transition-all before:content-['\f0d8'] sm:-mr-6 lg:absolute lg:right-0 lg:left-auto lg:mt-2 lg:block lg:cursor-pointer">
                    {/* add show class on dropdown open js */}
                    <li className="relative mb-2">
                    <a className="dark:hover:bg-slate-900 ease py-1.2 clear-both block w-full whitespace-nowrap rounded-lg bg-transparent px-4 duration-300 hover:bg-gray-200 hover:text-slate-700 lg:transition-colors" href="javascript:;">
                        <div className="flex py-1">
                        <div className="my-auto">
                            <img src="./assets/img/team-2.jpg" className="inline-flex items-center justify-center mr-4 text-sm text-white h-9 w-9 max-w-none rounded-xl" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <h6 className="mb-1 text-sm font-normal leading-normal dark:text-white"><span className="font-semibold">New message</span> from Laur</h6>
                            <p className="mb-0 text-xs leading-tight text-slate-400 dark:text-white/80">
                            <i className="mr-1 fa fa-clock" />
                            13 minutes ago
                            </p>
                        </div>
                        </div>
                    </a>
                    </li>
                    <li className="relative mb-2">
                    <a className="dark:hover:bg-slate-900 ease py-1.2 clear-both block w-full whitespace-nowrap rounded-lg px-4 transition-colors duration-300 hover:bg-gray-200 hover:text-slate-700" href="javascript:;">
                        <div className="flex py-1">
                        <div className="my-auto">
                            <img src="./assets/img/small-logos/logo-spotify.svg" className="inline-flex items-center justify-center mr-4 text-sm text-white bg-gradient-to-tl from-zinc-800 to-zinc-700 dark:bg-gradient-to-tl dark:from-slate-750 dark:to-gray-850 h-9 w-9 max-w-none rounded-xl" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <h6 className="mb-1 text-sm font-normal leading-normal dark:text-white"><span className="font-semibold">New album</span> by Travis Scott</h6>
                            <p className="mb-0 text-xs leading-tight text-slate-400 dark:text-white/80">
                            <i className="mr-1 fa fa-clock" />
                            1 day
                            </p>
                        </div>
                        </div>
                    </a>
                    </li>
                    <li className="relative">
                    <a className="dark:hover:bg-slate-900 ease py-1.2 clear-both block w-full whitespace-nowrap rounded-lg px-4 transition-colors duration-300 hover:bg-gray-200 hover:text-slate-700" href="javascript:;">
                        <div className="flex py-1">
                        <div className="inline-flex items-center justify-center my-auto mr-4 text-sm text-white transition-all duration-200 ease-nav-brand bg-gradient-to-tl from-slate-600 to-slate-300 h-9 w-9 rounded-xl">
                            <svg width="12px" height="12px" viewBox="0 0 43 36" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                            <title>credit-card</title>
                            <g stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
                                <g transform="translate(-2169.000000, -745.000000)" fill="#FFFFFF" fillRule="nonzero">
                                <g transform="translate(1716.000000, 291.000000)">
                                    <g transform="translate(453.000000, 454.000000)">
                                    <path className="color-background" d="M43,10.7482083 L43,3.58333333 C43,1.60354167 41.3964583,0 39.4166667,0 L3.58333333,0 C1.60354167,0 0,1.60354167 0,3.58333333 L0,10.7482083 L43,10.7482083 Z" opacity="0.593633743" />
                                    <path className="color-background" d="M0,16.125 L0,32.25 C0,34.2297917 1.60354167,35.8333333 3.58333333,35.8333333 L39.4166667,35.8333333 C41.3964583,35.8333333 43,34.2297917 43,32.25 L43,16.125 L0,16.125 Z M19.7083333,26.875 L7.16666667,26.875 L7.16666667,23.2916667 L19.7083333,23.2916667 L19.7083333,26.875 Z M35.8333333,26.875 L28.6666667,26.875 L28.6666667,23.2916667 L35.8333333,23.2916667 L35.8333333,26.875 Z" />
                                    </g>
                                </g>
                                </g>
                            </g>
                            </svg>
                        </div>
                        <div className="flex flex-col justify-center">
                            <h6 className="mb-1 text-sm font-normal leading-normal dark:text-white">Payment successfully completed</h6>
                            <p className="mb-0 text-xs leading-tight text-slate-400 dark:text-white/80">
                            <i className="mr-1 fa fa-clock" />
                            2 days
                            </p>
                        </div>
                        </div>
                    </a>
                    </li>
                </ul>
                </li>
            </ul>
            </div>
        </div>
        </nav>
        {/* end Navbar */}

        </>
    )
}

export default Navbar;