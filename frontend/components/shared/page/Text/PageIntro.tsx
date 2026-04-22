// import React from "react";

// type PageIntroProps = {
//   title: string;
//   description?: string;
//   actions?: React.ReactNode;
//   className?: string;
// };

// const PageIntro = ({
//   title,
//   description,
//   actions,
//   className = "",
// }: PageIntroProps) => {
//   return (
//     <div
//       className={`mt-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end ${className}`}
//     >
//       <div className="min-w-0">
//         <h1 className="title-xl">{title}</h1>

//         {description && <p className="paragraph mt-2">{description}</p>}
//       </div>

//       {actions && <div className="shrink-0">{actions}</div>}
//     </div>
//   );
// };

// export default PageIntro;

//============NEW==============
"use client";

import React from "react";
import AnimatedText from "./AnimatedText";

type PageIntroProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

const PageIntro = ({
  title,
  description,
  actions,
  className = "",
}: PageIntroProps) => {
  return (
    <div
      className={`mt-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end ${className}`}
    >
      <div className="min-w-0">
        <AnimatedText
          text={title}
          as="h1"
          className="title-xl"
          animateBy="words"
          delay={40}
        />

        {description && (
          <AnimatedText
            text={description}
            as="p"
            className="paragraph mt-2"
            animateBy="words"
            delay={20}
            animationFrom={{ filter: "blur(8px)", opacity: 0, y: 20 }}
            animationTo={[
              { filter: "blur(4px)", opacity: 0.5, y: 8 },
              { filter: "blur(0px)", opacity: 1, y: 0 },
            ]}
          />
        )}
      </div>

      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
};

export default PageIntro;
