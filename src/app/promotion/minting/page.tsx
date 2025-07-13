"use client";

import { useEffect, useState } from "react";

const MintingsPage = () => {
  const [data, setData] = useState<{ var1: string; var2: string; var3: string; var4: string } | null>(null);

  useEffect(() => {
    // Retrieve stored data when page loads
    const storedData = sessionStorage.getItem("mintingsData");
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  return (
    <div>
      <h1>Mintings Page</h1>
      {data ? (
        <>
          <p>Variable 1: {data.var1}</p>
          <p>Variable 2: {data.var2}</p>
          <p>Variable 3: {data.var3}</p>
          <p>Variable 4: {data.var4}</p>
        </>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default MintingsPage;

// "use client"; // Required in Client Components

// import { useSearchParams } from "next/navigation";

// const NewPage = () => {
//   const searchParams = useSearchParams();
//   const var1 = searchParams.get("var1");
//   const var2 = searchParams.get("var2");
//   const var3 = searchParams.get("var3");
//   const var4 = searchParams.get("var4");

//   return (
//     <div>
//       <h1>New Page</h1>
//       <p>Variable 1: {var1}</p>
//       <p>Variable 2: {var2}</p>
//       <p>Variable 3: {var3}</p>
//       <p>Variable 4: {var4}</p>
//     </div>
//   );
// };

// export default NewPage;