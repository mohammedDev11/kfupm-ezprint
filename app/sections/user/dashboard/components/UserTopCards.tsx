// "use client";

// import {
//   userDashboardCardsByPeriod,
//   userDashboardPeriods,
//   type UserDashboardPeriod,
// } from "@/Data/User/dashboard";
// import Card from "@/app/components/ui/card/Card";
// import {
//   Dropdown,
//   DropdownContent,
//   DropdownItem,
//   DropdownTrigger,
// } from "@/app/components/ui/dropdown/Dropdown";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { useEffect, useMemo, useRef, useState } from "react";

// const UserTopCards = () => {
//   const [selectedPeriod, setSelectedPeriod] =
//     useState<UserDashboardPeriod>("This Week");

//   const scrollRef = useRef<HTMLDivElement | null>(null);
//   const [canScrollLeft, setCanScrollLeft] = useState(false);
//   const [canScrollRight, setCanScrollRight] = useState(true);

//   const cards = useMemo(() => {
//     return userDashboardCardsByPeriod[selectedPeriod];
//   }, [selectedPeriod]);

//   const updateScrollState = () => {
//     const el = scrollRef.current;
//     if (!el) return;

//     setCanScrollLeft(el.scrollLeft > 4);
//     setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
//   };

//   useEffect(() => {
//     updateScrollState();

//     const el = scrollRef.current;
//     if (!el) return;

//     const onScroll = () => updateScrollState();

//     el.addEventListener("scroll", onScroll);
//     window.addEventListener("resize", updateScrollState);

//     return () => {
//       el.removeEventListener("scroll", onScroll);
//       window.removeEventListener("resize", updateScrollState);
//     };
//   }, [selectedPeriod]);

//   const scrollByCard = (direction: "prev" | "next") => {
//     const el = scrollRef.current;
//     if (!el) return;

//     const firstCard = el.querySelector(
//       "[data-card-item]"
//     ) as HTMLElement | null;
//     const gap = 16;
//     const cardWidth = firstCard?.offsetWidth ?? 280;
//     const amount = cardWidth + gap;

//     el.scrollBy({
//       left: direction === "next" ? amount : -amount,
//       behavior: "smooth",
//     });
//   };

//   return (
//     <section className="space-y-4">
//       <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
//         <div>
//           <p className="paragraph">
//             Quick personal printing statistics for{" "}
//             {selectedPeriod.toLowerCase()}.
//           </p>
//         </div>

//         <Dropdown
//           value={selectedPeriod}
//           onValueChange={(value) =>
//             setSelectedPeriod(value as UserDashboardPeriod)
//           }
//         >
//           <DropdownTrigger className="min-w-[170px] px-3 py-2.5">
//             <span
//               className="text-sm font-semibold"
//               style={{ color: "var(--title)" }}
//             >
//               {selectedPeriod}
//             </span>
//           </DropdownTrigger>

//           <DropdownContent align="right" widthClassName="w-48">
//             {userDashboardPeriods.map((period) => (
//               <DropdownItem key={period} value={period}>
//                 <span
//                   className="text-sm font-medium"
//                   style={{ color: "var(--paragraph)" }}
//                 >
//                   {period}
//                 </span>
//               </DropdownItem>
//             ))}
//           </DropdownContent>
//         </Dropdown>
//       </div>

//       <div className="space-y-3">
//         <div
//           ref={scrollRef}
//           className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2 scroll-smooth snap-x snap-mandatory scrollbar-none"
//         >
//           {cards.map((card) => {
//             const Icon = card.icon;
//             const isPositive =
//               card.change.startsWith("+") || card.change === "Ready to release";

//             return (
//               <Card
//                 key={card.id}
//                 data-card-item
//                 className="snap-start flex-shrink-0 min-w-[260px] sm:min-w-[280px] min-h-[170px] group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
//               >
//                 <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-brand-500/10 blur-2xl transition-all duration-300 group-hover:bg-brand-500/15" />

//                 <div className="relative z-10 flex h-full flex-col justify-between">
//                   <div className="flex items-start justify-between gap-3">
//                     <div className="min-w-0">
//                       <p
//                         className="text-lg font-medium leading-snug sm:text-xl"
//                         style={{ color: "var(--muted)" }}
//                       >
//                         {card.title}
//                       </p>
//                     </div>

//                     <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full">
//                       <div
//                         className="flex h-14 w-14 items-center justify-center rounded-full"
//                         style={{
//                           background: "rgba(55, 125, 255, 0.10)",
//                           color: "var(--color-brand-500)",
//                         }}
//                       >
//                         <Icon size={28} />
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-6">
//                     <h2
//                       className="text-[34px] font-bold leading-none sm:text-[40px]"
//                       style={{ color: "var(--title)" }}
//                     >
//                       {card.value}
//                     </h2>

//                     <p
//                       className="mt-3 text-base sm:text-lg"
//                       style={{
//                         color: isPositive
//                           ? "var(--muted)"
//                           : "var(--color-danger-600)",
//                       }}
//                     >
//                       {card.change}
//                     </p>
//                   </div>
//                 </div>
//               </Card>
//             );
//           })}
//         </div>

//         <div className="flex items-center justify-center gap-3">
//           <button
//             type="button"
//             onClick={() => scrollByCard("prev")}
//             disabled={!canScrollLeft}
//             className="flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 hover:-translate-y-0.5"
//             style={{
//               background: "var(--surface)",
//               borderColor: "var(--border)",
//               color: "var(--title)",
//             }}
//             aria-label="Previous card"
//           >
//             <ChevronLeft size={18} />
//           </button>

//           <button
//             type="button"
//             onClick={() => scrollByCard("next")}
//             disabled={!canScrollRight}
//             className="flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 hover:-translate-y-0.5"
//             style={{
//               background: "var(--surface)",
//               borderColor: "var(--border)",
//               color: "var(--title)",
//             }}
//             aria-label="Next card"
//           >
//             <ChevronRight size={18} />
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default UserTopCards;

"use client";

import {
  userDashboardCardsByPeriod,
  userDashboardPeriods,
  type UserDashboardPeriod,
} from "@/Data/User/dashboard";
import { apiGet } from "@/app/lib/api/client";
import Card from "@/app/components/ui/card/Card";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/app/components/ui/dropdown/Dropdown";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  FileText,
  Layers3,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const UserTopCards = () => {
  const [apiCards, setApiCards] = useState<
    Array<{ id: number; title: string; value: string; change: string; icon: any }>
  >([]);
  const [selectedPeriod, setSelectedPeriod] =
    useState<UserDashboardPeriod>("This Week");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const cards = useMemo(() => {
    if (apiCards.length > 0) return apiCards;
    return userDashboardCardsByPeriod[selectedPeriod];
  }, [apiCards, selectedPeriod]);

  useEffect(() => {
    let mounted = true;
    const iconMap: Record<string, any> = {
      "dollar-sign": DollarSign,
      "file-text": FileText,
      "layers-3": Layers3,
      "clock-3": Clock3,
    };

    apiGet<{ cards: Array<{ id: number; title: string; value: string; change: string; iconKey?: string }> }>(
      "/user/dashboard",
      "user"
    )
      .then((data) => {
        if (!mounted || !data?.cards?.length) return;
        setApiCards(
          data.cards.map((card) => ({
            ...card,
            icon: iconMap[card.iconKey || ""] || FileText,
          }))
        );
      })
      .catch(() => {
        // keep local fallback
      });

    return () => {
      mounted = false;
    };
  }, []);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();

    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => updateScrollState();

    el.addEventListener("scroll", onScroll);
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [selectedPeriod]);

  const scrollByCard = (direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;

    const firstCard = el.querySelector(
      "[data-card-item]"
    ) as HTMLElement | null;
    const gap = 16;
    const cardWidth = firstCard?.offsetWidth ?? 280;
    const amount = cardWidth + gap;

    el.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="paragraph">
            Quick personal printing statistics for{" "}
            {selectedPeriod.toLowerCase()}.
          </p>
        </div>

        <Dropdown
          value={selectedPeriod}
          onValueChange={(value) =>
            setSelectedPeriod(value as UserDashboardPeriod)
          }
        >
          <DropdownTrigger className="min-w-[170px] px-3 py-2.5">
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--title)" }}
            >
              {selectedPeriod}
            </span>
          </DropdownTrigger>

          <DropdownContent align="right" widthClassName="w-48">
            {userDashboardPeriods.map((period) => (
              <DropdownItem key={period} value={period}>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--paragraph)" }}
                >
                  {period}
                </span>
              </DropdownItem>
            ))}
          </DropdownContent>
        </Dropdown>
      </div>

      <div className="space-y-3">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2 scroll-smooth snap-x snap-mandatory scrollbar-none xl:grid xl:grid-cols-4 xl:overflow-visible"
        >
          {cards.map((card) => {
            const Icon = card.icon;
            const isPositive =
              card.change.startsWith("+") || card.change === "Ready to release";

            return (
              <Card
                key={card.id}
                data-card-item
                className="snap-start flex-shrink-0 min-w-[260px] sm:min-w-[280px] min-h-[170px] group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg xl:min-w-0 xl:w-full"
              >
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-brand-500/10 blur-2xl transition-all duration-300 group-hover:bg-brand-500/15" />

                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className="text-lg font-medium leading-snug sm:text-xl"
                        style={{ color: "var(--muted)" }}
                      >
                        {card.title}
                      </p>
                    </div>

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full"
                        style={{
                          background: "rgba(55, 125, 255, 0.10)",
                          color: "var(--color-brand-500)",
                        }}
                      >
                        <Icon size={28} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h2
                      className="text-[34px] font-bold leading-none sm:text-[40px]"
                      style={{ color: "var(--title)" }}
                    >
                      {card.value}
                    </h2>

                    <p
                      className="mt-3 text-base sm:text-lg"
                      style={{
                        color: isPositive
                          ? "var(--muted)"
                          : "var(--color-danger-600)",
                      }}
                    >
                      {card.change}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-3 xl:hidden">
          <button
            type="button"
            onClick={() => scrollByCard("prev")}
            disabled={!canScrollLeft}
            className="flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 hover:-translate-y-0.5"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--title)",
            }}
            aria-label="Previous card"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => scrollByCard("next")}
            disabled={!canScrollRight}
            className="flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 hover:-translate-y-0.5"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--title)",
            }}
            aria-label="Next card"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default UserTopCards;
