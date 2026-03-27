import React, { useState, useEffect } from 'react';
import ImageSlider from './ImageSlider';
import { useLocation, useNavigate } from 'react-router-dom';
import API_ENDPOINTS, { ASSETS_URL } from '../config/apiConfig';
import axios from 'axios';

const AuthLayout = ({ children, title }) => {
    const location = useLocation();
    const [branding, setBranding] = useState({
        name: 'BizLinks',
        logo: null,
        gallery: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const orgIdentifier = searchParams.get('org');

        if (orgIdentifier) {
            // URL parameter exists, use it
            fetchBranding(orgIdentifier);
        } else {
            // No URL parameter, check localStorage
            const storedOrgContext = localStorage.getItem('orgContext');
            if (storedOrgContext) {
                // Use stored organization context
                fetchBranding(storedOrgContext);
            } else {
                // No stored context, fetch first available organization
                fetchFirstOrganization();
            }
        }
    }, [location]);

    const fetchFirstOrganization = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_ENDPOINTS.ORGANIZATIONS}`);
            if (res.data.success && res.data.data && res.data.data.length > 0) {
                const firstOrg = res.data.data[0];
                const logoUrl = (firstOrg.logo && firstOrg.logo.startsWith('data:'))
                    ? firstOrg.logo
                    : (firstOrg.logo ? `${ASSETS_URL}${firstOrg.logo}` : null);

                setBranding({
                    name: firstOrg.name || 'BizLinks',
                    logo: logoUrl,
                    gallery: (firstOrg.gallery && firstOrg.gallery.length > 0) ? firstOrg.gallery : null
                });
            } else {
                // Fallback to defaults
                setBranding({
                    name: 'BizLinks',
                    logo: null,
                    gallery: null
                });
            }
        } catch (error) {
            console.error('Failed to fetch organizations:', error);
            // Fallback to defaults
            setBranding({
                name: 'BizLinks',
                logo: null,
                gallery: null
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchBranding = async (identifier) => {
        console.log('=== AUTHLAYOUT FETCH BRANDING ===');
        console.log('Fetching branding for identifier:', identifier);
        setLoading(true);
        try {
            const res = await axios.get(`${API_ENDPOINTS.ORGANIZATIONS}/public/${identifier}`);
            console.log('API Response:', res.data);
            if (res.data.success) {
                const { name, logo, gallery } = res.data.data;
                console.log('Extracted data - name:', name, 'logo:', logo ? 'present' : 'null');

                const logoUrl = (logo && logo.startsWith('data:'))
                    ? logo
                    : (logo ? `${ASSETS_URL}${logo}` : null);

                setBranding({
                    name: name || 'BizLinks',
                    logo: logoUrl,
                    gallery: (gallery && gallery.length > 0) ? gallery : null
                });
                console.log('Branding set to:', { name: name || 'BizLinks', logo: logo ? 'present' : 'default' });
                // Store this organization context
                localStorage.setItem('orgContext', identifier);
            } else {
                console.log('API returned success=false, using fallback');
                // Fallback to defaults on unsuccessful response but with valid structure
                setBranding({
                    name: 'BizLinks',
                    logo: null,
                    gallery: null
                });
            }
        } catch (error) {
            console.error('Failed to fetch org branding:', error);
            console.log('Using fallback branding due to error');
            // Fallback to defaults on error
            setBranding({
                name: 'BizLinks',
                logo: null,
                gallery: null
            });
        } finally {
            setLoading(false);
        }
    };

    const defaultLogo = "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&h=64&q=80";

    return (
        <div className="min-h-screen w-full flex overflow-hidden bg-[#78C4FF]">
            {/* Background pattern (Concentric waves) */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[20%] left-[-10%] w-[1000px] h-[1000px] border-[40px] border-white rounded-full" />
                <div className="absolute top-[20%] left-[-10%] w-[800px] h-[800px] border-[40px] border-white rounded-full opacity-60" />
                <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] border-[40px] border-white rounded-full opacity-40" />
            </div>

            <div className="relative z-10 flex w-full">
                {/* Left Side: Logo and Slider (Desktop) */}
                <div className="hidden lg:flex lg:flex-1 flex-col items-center justify-center p-12">
                    <div className="w-full max-w-md space-y-12">
                        {/* Logo and App Name */}
                        <div className="flex items-center gap-4">
                            <div className="p-1 bg-white rounded shadow-sm">
                                <img
                                    src={branding.logo || defaultLogo}
                                    alt="Logo"
                                    className="w-12 h-12 object-cover rounded"
                                    onError={(e) => {
                                        console.error('Logo failed to load:', branding.logo);
                                        e.target.src = defaultLogo;
                                    }}
                                />
                            </div>
                            <h1 className="text-5xl font-extrabold text-white tracking-tight">{branding.name}</h1>
                        </div>

                        {/* Automatic Slider */}
                        <ImageSlider customImages={branding.gallery} />
                    </div>
                </div>

                {/* Right Side: Auth Card */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">

                    {/* Mobile Branding (Visible only on mobile) */}
                    <div className="lg:hidden flex flex-col items-center mb-8 space-y-4">
                        <div className="p-2 bg-white rounded shadow-sm">
                            <img
                                src={branding.logo || defaultLogo}
                                alt="Logo"
                                className="w-16 h-16 object-cover rounded"
                                onError={(e) => { e.target.src = defaultLogo; }}
                            />
                        </div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight text-center">{branding.name}</h1>
                    </div>

                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden p-8 lg:p-12">
                        <h2 className="text-3xl font-medium text-gray-700 text-center mb-8">
                            {title ? `${title} ${branding.name}` : `Sign In to ${branding.name}`}
                        </h2>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
