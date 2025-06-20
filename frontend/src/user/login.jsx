const Login = () =>{
    return(
        <>
        <div>
        <div className="container sticky top-0 z-sticky">
            <div className="flex flex-wrap -mx-3">
            <div className="w-full max-w-full px-3 flex-0">
                {/* Navbar */}
                <nav className="absolute top-0 left-0 right-0 z-30 flex flex-wrap items-center px-4 py-2 m-6 mb-0 shadow-sm rounded-xl bg-white/80 backdrop-blur-2xl backdrop-saturate-200 lg:flex-nowrap lg:justify-start">
                <div className="flex items-center justify-between w-full p-0 px-6 mx-auto flex-wrap-inherit">
                    <a className="py-1.75 text-sm mr-4 ml-4 whitespace-nowrap font-bold text-slate-700 lg:ml-0" href="https://demos.creative-tim.com/argon-dashboard-tailwind/pages/dashboard.html" target="_blank"> Argon Dashboard 2 </a>
                    <button navbar-trigger className="px-3 py-1 ml-2 leading-none transition-all ease-in-out bg-transparent border border-transparent border-solid rounded-lg shadow-none cursor-pointer text-lg lg:hidden" type="button" aria-controls="navigation" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="inline-block mt-2 align-middle bg-center bg-no-repeat bg-cover w-6 h-6 bg-none">
                        <span bar1 className="w-5.5 rounded-xs relative my-0 mx-auto block h-px bg-gray-600 transition-all duration-300" />
                        <span bar2 className="w-5.5 rounded-xs mt-1.75 relative my-0 mx-auto block h-px bg-gray-600 transition-all duration-300" />
                        <span bar3 className="w-5.5 rounded-xs mt-1.75 relative my-0 mx-auto block h-px bg-gray-600 transition-all duration-300" />
                    </span>
                    </button>
                    <div navbar-menu className="items-center flex-grow transition-all duration-500 lg-max:overflow-hidden ease lg-max:max-h-0 basis-full lg:flex lg:basis-auto">
                    <ul className="flex flex-col pl-0 mx-auto mb-0 list-none lg:flex-row xl:ml-auto">
                        <li>
                        <a className="flex items-center px-4 py-2 mr-2 font-normal transition-all ease-in-out lg-max:opacity-0 duration-250 text-sm text-slate-700 lg:px-2" aria-current="page" href="../pages/dashboard.html">
                            <i className="mr-1 fa fa-chart-pie opacity-60" />
                            Dashboard
                        </a>
                        </li>
                        <li>
                        <a className="block px-4 py-2 mr-2 font-normal transition-all ease-in-out lg-max:opacity-0 duration-250 text-sm text-slate-700 lg:px-2" href="../pages/profile.html">
                            <i className="mr-1 fa fa-user opacity-60" />
                            Profile
                        </a>
                        </li>
                        <li>
                        <a className="block px-4 py-2 mr-2 font-normal transition-all ease-in-out lg-max:opacity-0 duration-250 text-sm text-slate-700 lg:px-2" href="../pages/sign-up.html">
                            <i className="mr-1 fas fa-user-circle opacity-60" />
                            Sign Up
                        </a>
                        </li>
                        <li>
                        <a className="block px-4 py-2 mr-2 font-normal transition-all ease-in-out lg-max:opacity-0 duration-250 text-sm text-slate-700 lg:px-2" href="../pages/sign-in.html">
                            <i className="mr-1 fas fa-key opacity-60" />
                            Sign In
                        </a>
                        </li>
                    </ul>
                    {/* online builder btn  */}
                    {/* <li class="flex items-center">
                        <a
                            class="leading-pro ease-in text-blue-500 border-blue-500 text-xs tracking-tight-rem bg-150 bg-x-25 rounded-3.5xl hover:border-blue-500 hover:-translate-y-px hover:text-blue-500 active:hover:border-blue-500 active:hover:-translate-y-px active:hover:text-blue-500 active:opacity-85 active:shadow-xs active:bg-blue-500 active:border-blue-500 mr-2 mb-0 inline-block cursor-pointer border border-solid bg-transparent py-2 px-8 text-center align-middle font-bold uppercase shadow-none transition-all hover:bg-transparent hover:opacity-75 hover:shadow-none active:scale-100 active:text-white active:hover:bg-transparent active:hover:opacity-75 active:hover:shadow-none"
                            target="_blank"
                            href="https://www.creative-tim.com/builder/soft-ui?ref=navbar-dashboard&amp;_ga=2.76518741.1192788655.1647724933-1242940210.1644448053"
                            >Online Builder</a
                        >
                        </li> */}
                    <ul className="hidden pl-0 mb-0 list-none lg:block lg:flex-row">
                        <li>
                        <a href="https://www.creative-tim.com/product/argon-dashboard-tailwind" target="_blank" className="inline-block px-8 py-2 mb-0 mr-1 font-bold leading-normal text-center text-white align-middle transition-all ease-in bg-blue-500 border-0 rounded-lg shadow-md cursor-pointer hover:-translate-y-px hover:shadow-xs active:opacity-85 text-xs tracking-tight-rem">Free Download</a>
                        </li>
                    </ul>
                    </div>
                </div>
                </nav>
            </div>
            </div>
        </div>
        <main className="mt-0 transition-all duration-200 ease-in-out">
            <section>
            <div className="relative flex items-center min-h-screen p-0 overflow-hidden bg-center bg-cover">
                <div className="container z-1">
                <div className="flex flex-wrap -mx-3">
                    <div className="flex flex-col w-full max-w-full px-3 mx-auto lg:mx-0 shrink-0 md:flex-0 md:w-7/12 lg:w-5/12 xl:w-4/12">
                    <div className="relative flex flex-col min-w-0 break-words bg-transparent border-0 shadow-none lg:py4 dark:bg-gray-950 rounded-2xl bg-clip-border">
                        <div className="p-6 pb-0 mb-0">
                        <h4 className="font-bold">Sign In</h4>
                        <p className="mb-0">Enter your email and password to sign in</p>
                        </div>
                        <div className="flex-auto p-6">
                        <form role="form">
                            <div className="mb-4">
                            <input type="email" placeholder="Email" className="focus:shadow-primary-outline dark:bg-gray-950 dark:placeholder:text-white/80 dark:text-white/80 text-sm leading-5.6 ease block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding p-3 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-fuchsia-300 focus:outline-none" />
                            </div>
                            <div className="mb-4">
                            <input type="password" placeholder="Password" className="focus:shadow-primary-outline dark:bg-gray-950 dark:placeholder:text-white/80 dark:text-white/80 text-sm leading-5.6 ease block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding p-3 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-fuchsia-300 focus:outline-none" />
                            </div>
                            <div className="flex items-center pl-12 mb-0.5 text-left min-h-6">
                            <input id="rememberMe" className="mt-0.5 rounded-10 duration-250 ease-in-out after:rounded-circle after:shadow-2xl after:duration-250 checked:after:translate-x-5.3 h-5 relative float-left -ml-12 w-10 cursor-pointer appearance-none border border-solid border-gray-200 bg-zinc-700/10 bg-none bg-contain bg-left bg-no-repeat align-top transition-all after:absolute after:top-px after:h-4 after:w-4 after:translate-x-px after:bg-white after:content-[''] checked:border-blue-500/95 checked:bg-blue-500/95 checked:bg-none checked:bg-right" type="checkbox" />
                            <label className="ml-2 font-normal cursor-pointer select-none text-sm text-slate-700" htmlFor="rememberMe">Remember me</label>
                            </div>
                            <div className="text-center">
                            <button type="button" className="inline-block w-full px-16 py-3.5 mt-6 mb-0 font-bold leading-normal text-center text-white align-middle transition-all bg-blue-500 border-0 rounded-lg cursor-pointer hover:-translate-y-px active:opacity-85 hover:shadow-xs text-sm ease-in tracking-tight-rem shadow-md bg-150 bg-x-25">Sign in</button>
                            </div>
                        </form>
                        </div>
                        <div className="border-black/12.5 rounded-b-2xl border-t-0 border-solid p-6 text-center pt-0 px-1 sm:px-6">
                        <p className="mx-auto mb-6 leading-normal text-sm">Don't have an account? <a href="../pages/sign-up.html" className="font-semibold text-transparent bg-clip-text bg-gradient-to-tl from-blue-500 to-violet-500">Sign up</a></p>
                        </div>
                    </div>
                    </div>
                    <div className="absolute top-0 right-0 flex-col justify-center hidden w-6/12 h-full max-w-full px-3 pr-0 my-auto text-center flex-0 lg:flex">
                    <div className="relative flex flex-col justify-center h-full bg-cover px-24 m-4 overflow-hidden bg-[url('https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/signin-ill.jpg')] rounded-xl ">
                        <span className="absolute top-0 left-0 w-full h-full bg-center bg-cover bg-gradient-to-tl from-blue-500 to-violet-500 opacity-60" />
                        <h4 className="z-20 mt-12 font-bold text-white">"Attention is the new currency"</h4>
                        <p className="z-20 text-white ">The more effortless the writing looks, the more effort the writer actually put into the process.</p>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </section>
        </main>
        <footer className="py-12">
            <div className="container">
            <div className="flex flex-wrap -mx-3">
                <div className="flex-shrink-0 w-full max-w-full mx-auto mb-6 text-center lg:flex-0 lg:w-8/12">
                <a href="javascript:;" target="_blank" className="mb-2 mr-4 text-slate-400 sm:mb-0 xl:mr-12"> Company </a>
                <a href="javascript:;" target="_blank" className="mb-2 mr-4 text-slate-400 sm:mb-0 xl:mr-12"> About Us </a>
                <a href="javascript:;" target="_blank" className="mb-2 mr-4 text-slate-400 sm:mb-0 xl:mr-12"> Team </a>
                <a href="javascript:;" target="_blank" className="mb-2 mr-4 text-slate-400 sm:mb-0 xl:mr-12"> Products </a>
                <a href="javascript:;" target="_blank" className="mb-2 mr-4 text-slate-400 sm:mb-0 xl:mr-12"> Blog </a>
                <a href="javascript:;" target="_blank" className="mb-2 mr-4 text-slate-400 sm:mb-0 xl:mr-12"> Pricing </a>
                </div>
                <div className="flex-shrink-0 w-full max-w-full mx-auto mt-2 mb-6 text-center lg:flex-0 lg:w-8/12">
                <a href="javascript:;" target="_blank" className="mr-6 text-slate-400">
                    <span className="text-lg fab fa-dribbble" />
                </a>
                <a href="javascript:;" target="_blank" className="mr-6 text-slate-400">
                    <span className="text-lg fab fa-twitter" />
                </a>
                <a href="javascript:;" target="_blank" className="mr-6 text-slate-400">
                    <span className="text-lg fab fa-instagram" />
                </a>
                <a href="javascript:;" target="_blank" className="mr-6 text-slate-400">
                    <span className="text-lg fab fa-pinterest" />
                </a>
                <a href="javascript:;" target="_blank" className="mr-6 text-slate-400">
                    <span className="text-lg fab fa-github" />
                </a>
                </div>
            </div>
            <div className="flex flex-wrap -mx-3">
                <div className="w-8/12 max-w-full px-3 mx-auto mt-1 text-center flex-0">
                <p className="mb-0 text-slate-400">
                    Copyright ©
                    Argon Dashboard 2 by Creative Tim.
                </p>
                </div>
            </div>
            </div>
        </footer>
        </div>

        </>
    )
}

export default Login;