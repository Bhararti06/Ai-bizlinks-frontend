import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const SuperAdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const { login } = useAuth();
    const navigate = useNavigate();

    const slides = [
        {
            image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            title: 'Find new friends',
            description: 'It is a long established fact that a reader will be distracted by the readable content.'
        },
        {
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            title: 'Connect with the world',
            description: 'It is a long established fact that a reader will be distracted by the readable content.'
        },
        {
            image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            title: 'Create new events',
            description: 'It is a long established fact that a reader will be distracted by the readable content.'
        }
    ];

    // Auto-rotate slides every 3 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 3000);

        return () => clearInterval(timer);
    }, [slides.length]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await login(formData.email, formData.password);
            const userEmail = res?.data?.user?.email;
            const userRole = res?.data?.user?.role;

            if (userEmail === 'superadmin@bizlinks.in' || userRole === 'super_admin') {
                toast.success('Super Admin Login successful');
                navigate('/super-admin/dashboard');
            } else {
                if (userRole === 'admin' || userRole === 'chapter_admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen w-full flex overflow-hidden bg-[#5badff]">
            {/* Background pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[20%] left-[-10%] w-[1000px] h-[1000px] border-[40px] border-white rounded-full" />
                <div className="absolute top-[20%] left-[-10%] w-[800px] h-[800px] border-[40px] border-white rounded-full opacity-60" />
                <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] border-[40px] border-white rounded-full opacity-40" />
            </div>

            <div className="relative z-10 flex w-full flex-col lg:flex-row h-screen lg:h-auto overflow-y-auto lg:overflow-visible">
                {/* Left Side: Carousel (Mobile: Top) */}
                <div className="flex flex-col items-center justify-center p-6 lg:p-12 text-white shrink-0 lg:flex-1 lg:h-screen">
                    <div className="w-full max-w-md flex flex-col items-center text-center space-y-4 lg:space-y-6">
                        {/* Logo CB */}
                        <div className="flex items-center gap-2 mb-2 lg:mb-0">
                            <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4L4 8l0 8l8 4l8-4l0-8L12 4z" />
                            </svg>
                            <span className="text-3xl lg:text-4xl font-bold tracking-wider">CB</span>
                        </div>

                        {/* Carousel Image - Visible on Mobile too, but smaller */}
                        <div className="rounded-lg overflow-hidden shadow-lg w-full max-w-[200px] aspect-[4/3] lg:w-64 lg:h-48 bg-gray-200 relative">
                            {slides.map((slide, index) => (
                                <img
                                    key={index}
                                    src={slide.image}
                                    alt={slide.title}
                                    className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Carousel Text */}
                        <div className="w-full min-h-[80px] lg:min-h-[100px] relative">
                            {slides.map((slide, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-opacity duration-500 flex flex-col items-center justify-start ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                        }`}
                                >
                                    <h2 className="text-lg lg:text-xl font-bold mb-1 lg:mb-2">{slide.title}</h2>
                                    <p className="text-xs opacity-90 leading-relaxed px-4 hidden sm:block">
                                        {slide.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Carousel Indicators */}
                        <div className="flex gap-2">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-1.5 lg:h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-4 lg:w-6' : 'bg-white/50 w-1.5 lg:w-2'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form (Mobile: Bottom card) */}
                <div className="flex-1 flex items-start lg:items-center justify-center p-4 lg:p-12 w-full">
                    <div className="w-full max-w-md bg-white rounded-2xl flex flex-col p-6 lg:p-10 shadow-xl mb-8 lg:mb-0">
                        <h2 className="text-xl lg:text-2xl font-normal text-gray-700 text-center mb-6 lg:mb-10">Sign In to CB!</h2>

                        <form className="space-y-4 lg:space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-xs font-medium text-gray-500 mb-1">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter email"
                                    autoComplete="email"
                                    required
                                    className="block w-full rounded border border-gray-200 py-2.5 text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-xs font-medium text-gray-500 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter Password"
                                        autoComplete="current-password"
                                        required
                                        className="block w-full rounded border border-gray-200 py-2.5 pr-10 text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-4 w-4" />
                                        ) : (
                                            <EyeIcon className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <Link to="/forgot-password" className="text-xs font-medium text-blue-500 hover:text-blue-600">
                                    Forgot Password?
                                </Link>
                                <button
                                    type="submit"
                                    className="rounded bg-[#4facfe] px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                >
                                    Sign in
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 text-xs text-gray-500 text-center">
                            Don't have an account?{' '}
                            <Link to="/register-user" className="font-semibold text-blue-500 hover:text-blue-600">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
