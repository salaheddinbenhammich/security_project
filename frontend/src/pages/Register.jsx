import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // MOCK: plus tard tu remplaceras par un appel API /auth/register
    console.log("REGISTER MOCK:", form);
    navigate("/login");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder=""
                value={form.email}
                onChange={onChange("email")}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                placeholder=""
                value={form.fullName}
                onChange={onChange("fullName")}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder=""
                value={form.phone}
                onChange={onChange("phone")}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder=""
                value={form.password}
                onChange={onChange("password")}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder=""
                value={form.confirmPassword}
                onChange={onChange("confirmPassword")}
                required
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-red-500">{error}</p>
            )}

            <Button type="submit" className="w-full mt-2">
              Create account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <span className="text-xs text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Login
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
