"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth/auth-client";
import { getSafeCallbackUrl } from "@/lib/auth/safe-callback-url";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function SignUpForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const searchParams = useSearchParams();
    const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
    const signInUrl = `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`;

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const result = await signUp.email({
                name,
                email,
                password,
            });

            if (result.error) {
                setError(result.error.message ?? "Failed to sign up");
            } else {
                window.location.replace(callbackUrl);
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white p-4">
            <Card className="w-full max-w-md border-gray-200 shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-black">Sign Up</CardTitle>
                    <CardDescription className="text-gray-600">
                        Create an account to start tracking your workspace tasks.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                                required
                                className="border-gray-300 focus:border-primary focus:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                required
                                className="border-gray-300 focus:border-primary focus:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Password"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                minLength={8}
                                required
                                className="border-gray-300 focus:border-primary focus:ring-primary"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Sign Up"}
                        </Button>
                        <p className="text-center text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link href={signInUrl} className="font-medium text-primary hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
