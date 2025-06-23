import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Déclarer la fonction dans la portée globale
    window.handleRecaptchaChange = (token) => {
      setRecaptchaToken(token);
    };

    const loadRecaptcha = () => {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    };

    loadRecaptcha();

    // Nettoyage
    return () => {
      delete window.handleRecaptchaChange;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!recaptchaToken) {
      setError('Veuillez vérifier que vous n\'êtes pas un robot');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/users/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe, recaptchaToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.data?.user) {
        localStorage.setItem('user', JSON.stringify(data.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div>
        <div className="container sticky top-0 z-sticky">
          <div className="flex flex-wrap -mx-3">
            <div className="w-full max-w-full px-3 flex-0">
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
                        {error && (
                          <div className="mb-4 p-3 text-red-500 bg-red-500 rounded-lg text-sm">
                            {error}
                          </div>
                        )}
                        <form role="form" onSubmit={handleSubmit}>
                          <div className="mb-4">
                            <input 
                              type="email" 
                              placeholder="Email" 
                              className="focus:shadow-primary-outline dark:bg-gray-950 dark:placeholder:text-white/80 dark:text-white/80 text-sm leading-5.6 ease block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding p-3 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-fuchsia-300 focus:outline-none" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div className="mb-4">
                            <input 
                              type="password" 
                              placeholder="Password" 
                              className="focus:shadow-primary-outline dark:bg-gray-950 dark:placeholder:text-white/80 dark:text-white/80 text-sm leading-5.6 ease block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding p-3 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-fuchsia-300 focus:outline-none" 
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                            />
                          </div>
                          <div className="flex items-center pl-12 mb-0.5 text-left min-h-6">
                            <input 
                              id="rememberMe" 
                              className="mt-0.5 rounded-10 duration-250 ease-in-out after:rounded-circle after:shadow-2xl after:duration-250 checked:after:translate-x-5.3 h-5 relative float-left -ml-12 w-10 cursor-pointer appearance-none border border-solid border-gray-200 bg-zinc-700/10 bg-none bg-contain bg-left bg-no-repeat align-top transition-all after:absolute after:top-px after:h-4 after:w-4 after:translate-x-px after:bg-white after:content-[''] checked:border-blue-500/95 checked:bg-blue-500/95 checked:bg-none checked:bg-right" 
                              type="checkbox" 
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label className="ml-2 font-normal cursor-pointer select-none text-sm text-slate-700" htmlFor="rememberMe">
                              Remember me
                            </label>
                          </div>

                          <div className="mb-4">
                            <div
                              className="g-recaptcha"
                              data-sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                              data-callback="handleRecaptchaChange">
                            </div>
                          </div>

                          <div className="text-center">
                            <button 
                              type="submit" 
                              className="inline-block w-full px-16 py-3.5 mt-6 mb-0 font-bold leading-normal text-center text-white align-middle transition-all bg-blue-500 border-0 rounded-lg cursor-pointer hover:-translate-y-px active:opacity-85 hover:shadow-xs text-sm ease-in tracking-tight-rem shadow-md bg-150 bg-x-25"
                              disabled={loading}
                            >
                              {loading ? 'Loading...' : 'Sign in'}
                            </button>
                          </div>
                        </form>
                      </div>
                      <div className="border-black/12.5 rounded-b-2xl border-t-0 border-solid p-6 text-center pt-0 px-1 sm:px-6">
                        <p className="mx-auto mb-6 leading-normal text-sm">
                          Don't have an account?{' '}
                          <Link to="/signup" className="font-semibold text-transparent bg-clip-text bg-gradient-to-tl from-blue-500 to-violet-500">
                            Sign up
                          </Link>
                        </p>
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
  );
};

export default Login;