import MenuC from "@components/Menu";
import Spinner from "@components/Spinner";
import { parse, parseISO } from "date-fns";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { now } from "src/constants/config";
import { api } from "src/utils/api";
import { BsCart } from "react-icons/bs";
import Cart from "~/components/Cart";

// interface menuProps {}

const Menu: FC = ({}) => {
  const router = useRouter();

  const [selectedTime, setSelectedTime] = useState<string | null>(null); // as ISO string
  const { isFetchedAfterMount, isError, error } =
    api.menu.checkMenuStatus.useQuery();

  const [showCart, setShowCart] = useState<boolean>(false);
  const [productsInCart, setProductsInCart] = useState<
    { id: string; quantity: number }[]
  >([]);
  const addToCart = (id: string, quantity: number) => {
    setProductsInCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) => {
          if (item.id === id)
            return { ...item, quantity: item.quantity + quantity };
          return item;
        });
      }
      return [...prev, { id, quantity }];
    });
  };

  const removeFromCart = (id: string) => {
    setProductsInCart((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    if (isError) {
      console.error("Error occurred:", error?.message);
      router.push("/"); // Redirect if query fails
      return;
    }

    if (typeof window === "undefined") return;

    const storedTime = localStorage.getItem("selectedTime");
    if (!storedTime) {
      router.push("/");
    } else {
      const date = parseISO(storedTime);
      if (date < now) {
        router.push("/");
      } else {
        setSelectedTime(storedTime);
      }
    }
  }, [isError, error, router]);

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Error occurred while fetching menu status</p>
      </div>
    );
  }

  return (
    <>
      <Cart
        removeFromCart={removeFromCart}
        open={showCart}
        setOpen={setShowCart}
        products={productsInCart}
      />
      {isFetchedAfterMount && selectedTime ? (
        <>
          <div className=" mx-auto mt-12 max-w-7xl sm:px-6 lg:px-8">
            {/* Cart Icon */}
            <div className=" flex w-full justify-end">
              <button
                type="button"
                onClick={() => setShowCart((prev) => !prev)}
                className="flex items-center justify-center rounded-lg bg-gray-200 p-3 text-lg font-medium text-indigo-600"
              >
                <BsCart className=" mr-2 text-lg" />
                {productsInCart.reduce((acc, item) => acc + item.quantity, 0)}
              </button>
            </div>
          </div>

          <MenuC addToCart={addToCart} selectedTime={selectedTime} />
        </>
      ) : (
        <div className=" flex h-screen items-center justify-center">
          <Spinner />
        </div>
      )}
    </>
  );
};

export default Menu;
