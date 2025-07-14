"use client"
import { useState } from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                setMessage('Successfully subscribed!');
                setEmail('');
            } else {
                setMessage('Subscription failed. Please try again.');
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <footer className="footer bg-base-200 text-base-content p-10">
            <aside>
                <p>
                    <span>©</span> {currentYear} influx.io
                    <br />
                    All rights reserved
                </p>
            </aside>

            <nav>
                <h6 className="footer-title">Company</h6>
                <a className="link link-hover">About us</a>
                <a className="link link-hover">Contact</a>
            </nav>
            <nav>
                <h6 className="footer-title">Legal</h6>
                <a className="link link-hover">Terms of use</a>
                <a className="link link-hover">Privacy policy</a>
                <a className="link link-hover">Cookie policy</a>
            </nav>

            <nav>
                <h6 className="footer-title">Newsletter</h6>
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com" 
                        className="input input-bordered w-full max-w-xs bg-transparent"
                        required
                    />
                    <button 
                        className="btn btn-outline w-full max-w-xs" 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Subscribing...' : 'Subscribe'}
                    </button>
                    {message && (
                        <p className={`text-sm ${message.includes('Successfully') ? 'text-success' : 'text-error'}`}>
                            {message}
                        </p>
                    )}
                </form>
            </nav>
        </footer>
    );
}

export default Footer;