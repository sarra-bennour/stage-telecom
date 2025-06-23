import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    tel: '',
    role: 'technicien'
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    // Déclarer la fonction de callback globale
    window.handleRecaptchaChange = (token) => {
      setRecaptchaToken(token);
    };

    // Charger le script reCAPTCHA (sans le paramètre render dans l'URL)
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      // Nettoyage
      document.body.removeChild(script);
      delete window.handleRecaptchaChange;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!agreeTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
      setLoading(false);
      return;
    }

    if (!recaptchaToken) {
      setError('Veuillez vérifier que vous n\'êtes pas un robot');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken // Ajouter le token reCAPTCHA
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Échec de l\'inscription');
      }

      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <main className="mt-0 transition-all duration-200 ease-in-out">
        <section className="min-h-screen">
          <div className="bg-top relative flex items-start pt-12 pb-56 m-4 overflow-hidden bg-cover min-h-50-screen rounded-xl bg-[url('https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/signup-cover.jpg')]">
            <span className="absolute top-0 left-0 w-full h-full bg-center bg-cover bg-gradient-to-tl from-zinc-800 to-zinc-700 opacity-60" />
            <div className="container z-10">
              <div className="flex flex-wrap justify-center -mx-3">
                <div className="w-full max-w-full px-3 mx-auto mt-0 text-center lg:flex-0 shrink-0 lg:w-5/12">
                  <h1 className="mt-12 mb-2 text-white">Welcome!</h1>
                  <p className="text-white">Use these awesome forms to login or create new account in your project for free.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="flex flex-wrap -mx-3 -mt-48 md:-mt-56 lg:-mt-48">
              <div className="w-full max-w-full px-3 mx-auto mt-0 md:flex-0 shrink-0 md:w-7/12 lg:w-5/12 xl:w-4/12">
                <div className="relative z-0 flex flex-col min-w-0 break-words bg-white border-0 shadow-xl rounded-2xl bg-clip-border">
                  <div className="p-6 mb-0 text-center bg-white border-b-0 rounded-t-2xl">
                    <h5>Register with</h5>
                  </div>
                  <div className="flex-auto p-6">
                    {error && (
                      <div className="mb-4 p-3 text-red-500 bg-red-500 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                    <form role="form text-left" onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <input 
                          type="text" 
                          name="nom"
                          className="placeholder:text-gray-500 text-sm focus:shadow-primary-outline leading-5.6 ease block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding py-2 px-3 font-normal text-gray-700 transition-all focus:border-blue-500 focus:bg-white focus:text-gray-700 focus:outline-none focus:transition-shadow" 
                          placeholder="Nom" 
                          aria-label="Nom" 
                          value={formData.nom}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <input 
                          type="text" 
                          name="prenom"
                          className="placeholder:text-gray-500 text-sm focus:shadow-primary-outline leading-5.6 ease block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding py-2 px-3 font-normal text-gray-700 transition-all focus:border-blue-500 focus:bg-white focus:text-gray-700 focus:outline-none focus:transition-shadow" 
                          placeholder="Prénom" 
                          aria-label="Prénom" 
                          value={formData.prenom}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <input 
                          type="email" 
                          name="email"
                          className="placeholder:text-gray-500 text-sm focus:shadow-primary-outline leading-5.6 ease block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding py-2 px-3 font-normal text-gray-700 transition-all focus:border-blue-500 focus:bg-white focus:text-gray-700 focus:outline-none focus:transition-shadow" 
                          placeholder="Email" 
                          aria-label="Email" 
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <input 
                          type="password" 
                          name="password"
                          className="placeholder:text-gray-500 text-sm focus:shadow-primary-outline leading-5.6 ease block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding py-2 px-3 font-normal text-gray-700 transition-all focus:border-blue-500 focus:bg-white focus:text-gray-700 focus:outline-none focus:transition-shadow" 
                          placeholder="Password" 
                          aria-label="Password" 
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <input 
                          type="tel" 
                          name="tel"
                          className="placeholder:text-gray-500 text-sm focus:shadow-primary-outline leading-5.6 ease block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding py-2 px-3 font-normal text-gray-700 transition-all focus:border-blue-500 focus:bg-white focus:text-gray-700 focus:outline-none focus:transition-shadow" 
                          placeholder="Téléphone" 
                          aria-label="Téléphone" 
                          value={formData.tel}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="min-h-6 pl-7 mb-0.5 block">
                        <input 
                          className="w-4.8 h-4.8 ease -ml-7 rounded-1.4 checked:bg-gradient-to-tl checked:from-blue-500 checked:to-violet-500 after:text-xxs after:font-awesome after:duration-250 after:ease-in-out duration-250 relative float-left mt-1 cursor-pointer appearance-none border border-solid border-slate-200 bg-white bg-contain bg-center bg-no-repeat align-top transition-all after:absolute after:flex after:h-full after:w-full after:items-center after:justify-center after:text-white after:opacity-0 after:transition-all after:content-['\f00c'] checked:border-0 checked:border-transparent checked:bg-transparent checked:after:opacity-100" 
                          type="checkbox" 
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          required
                        />
                        <label className="mb-2 ml-1 font-normal cursor-pointer text-sm text-slate-700" htmlFor="flexCheckDefault">
                          I agree the <a href="javascript:;" className="font-bold text-slate-700">Terms and Conditions</a>
                        </label>
                      </div>

                      <div className="mb-4">
                        <div
                          className="g-recaptcha"
                          data-sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                          data-callback="handleRecaptchaChange"
                        ></div>
                      </div>

                      <div className="text-center">
                        <button 
                          type="submit" 
                          className="inline-block w-full px-5 py-2.5 mt-6 mb-2 font-bold text-center text-white align-middle transition-all bg-transparent border-0 rounded-lg cursor-pointer active:opacity-85 hover:-translate-y-px hover:shadow-xs leading-normal text-sm ease-in tracking-tight-rem shadow-md bg-150 bg-x-25 bg-gradient-to-tl from-zinc-800 to-zinc-700 hover:border-slate-700 hover:bg-slate-700 hover:text-white"
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Sign up'}
                        </button>
                      </div>
                      <p className="mt-4 mb-0 leading-normal text-sm">
                        Already have an account? <a href="/" className="font-bold text-slate-700">Sign in</a>
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Signup;