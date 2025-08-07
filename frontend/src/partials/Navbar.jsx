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
                
            </div>
            <ul className="flex flex-row justify-end pl-0 mb-0 list-none md-max:w-full">
                <li className="flex items-center" style={{ marginRight: '16px' }}>
                    <button 
                    onClick={handleLogout}
                    className="block px-0 py-2 text-sm font-semibold text-white transition-all ease-nav-brand"
                    >
                    <i className="fa fa-user sm:mr-1" />
                    <span className="hidden sm:inline">Log Out</span>
                    </button>
                </li>
                <li className="flex items-center">
                <button 
                    onClick={() => navigate('/history')}
                    className="block px-0 py-2 text-sm font-semibold text-white transition-all ease-nav-brand"
                >
                    <i className="fa fa-history sm:mr-1" />
                    <span className="hidden sm:inline">Historique</span>
                </button>
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