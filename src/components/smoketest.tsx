type SmokeTestProps = {
  label?: string;
};

export default function SmokeTest({ label = "React mounted inside Astro" }: SmokeTestProps) {
  return <h1>{label}</h1>;
}
