'use client'

import { ChatHeader } from "@/components/ui/chat-header";
import { Phone } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function CallPage() {
    const { user } = useUser();
    const [email, setEmail] = useState(user?.emailAddresses?.[0]?.emailAddress || "");
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setSubscribed(true);
            setLoading(false);
        }, 1200);
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <ChatHeader />
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-6">
                    <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <Phone className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-semibold">
                        {user?.firstName ? `Hi ${user.firstName}, ` : ''}Voice Call Coming Soon
                    </h1>
                    <p className="text-muted-foreground max-w-md">
                        We&apos;re working on bringing you high-quality voice calls with AI. Stay tuned for this exciting feature!
                    </p>
                    {!subscribed ? (
                        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 items-center justify-center mt-4">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Enter your email to subscribe"
                                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-primary bg-background text-foreground"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition"
                            >
                                {loading ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-green-600 font-medium mt-2">Thank you for subscribing!</div>
                    )}
                </div>
            </div>
        </div>
    );
}