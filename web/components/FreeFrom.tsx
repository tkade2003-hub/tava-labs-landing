import Image from "next/image";

export const FREE_FROM = [
  { name: "Cruelty Free", blurb: "Never tested on animals.", img: "/assets/IMG_3162.jpeg" },
  { name: "Fragrance Free", blurb: "No added perfumes or synthetic scents.", img: "/assets/IMG_3163.jpeg" },
  { name: "Mineral Oil Free", blurb: "No mineral oil or petroleum fillers.", img: "/assets/IMG_3164.jpeg" },
  { name: "Phthalate Free", blurb: "No phthalates in the formula.", img: "/assets/IMG_3166.jpeg" },
  { name: "Silicone Free", blurb: "No silicones coating your skin.", img: "/assets/IMG_3167.jpeg" },
  { name: "Sulfate Free", blurb: "No harsh sulfates. Gentle on skin.", img: "/assets/IMG_3168.jpeg" },
  { name: "Allergen Free", blurb: "Made without common allergens.", img: "/assets/IMG_3169.jpeg" },
  { name: "Alcohol Free", blurb: "No drying alcohols.", img: "/assets/IMG_3170.jpeg" },
];

// The "made without" list, set as an editorial index with hairline rules
// rather than a grid of identical cards.
export default function FreeFrom({
  items = FREE_FROM,
}: {
  items?: readonly { name: string; blurb: string; img: string }[];
}) {
  return (
    <ul className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <li
          key={item.name}
          className="flex items-start gap-4 border-t border-linestone py-5"
        >
          <Image
            src={item.img}
            alt={item.name}
            width={44}
            height={44}
            className="mt-0.5 size-11 shrink-0 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-forest-deep">{item.name}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink/65">
              {item.blurb}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
