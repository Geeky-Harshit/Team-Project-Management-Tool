"use client"

import { Briefcase } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { signOut, useSession } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NavBar() {
  const router = useRouter()
  const { data: session } = useSession()
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="flex h-16 w-full items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary">
          <Briefcase />
          TMT
        </Link>
        <div className="flex items-center gap-4">
          {
            session?.user
              ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-gray-700 hover:text-black">Dashboard</Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-white">{session.user.name[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{session.user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                          </div>
                        </DropdownMenuLabel>
                      </DropdownMenuGroup>
                      <DropdownMenuItem className="cursor-pointer"
                        onClick={async () => {
                          const result = await signOut()

                          if (result.data) {
                            router.push("/sign-in")
                          }
                          else {
                            toast.error("Error signing out");
                          }
                        }}
                      >
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )
              : (
                <>
                  <Link href="/sign-in">
                    <Button variant="ghost" className="text-gray-700 hover:text-black">Log In</Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button className="bg-primary hover:bg-primary/90">Sign Up</Button>
                  </Link>
                </>
              )
          }
        </div>
      </div>
    </nav>
  )
}