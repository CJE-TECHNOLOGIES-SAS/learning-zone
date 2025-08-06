import { AnimationNavbar } from "../animations/AnimationNavbar";

export default function Navbar() {
  const items = [
  { label: "Register", href: "register" },
  { label: "Login", href: "login" },
];
  return (
  <>
    <AnimationNavbar
      items={items}
      particleCount={35}
      particleDistances={[90, 10]}
      particleR={100}
      initialActiveIndex={0}
      animationTime={330}
      timeVariance={300}
      colors={[1, 2, 3, 1, 2, 3, 1, 4]}
    />
</>
  )
}
