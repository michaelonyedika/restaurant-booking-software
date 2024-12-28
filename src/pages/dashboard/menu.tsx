import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import type { MultiValue } from "react-select";
import { MAX_FILE_SIZE } from "~/constants/config";
import { api } from "~/utils/api";
import { selectOptions } from "~/utils/helper";
import type { Categories } from "~/utils/types";

const DynamicSelect = dynamic(() => import("react-select"), { ssr: false });

type Input = {
  name: string;
  price: number;
  categories: MultiValue<{ value: string; label: string }>;
  file: File | undefined;
};

const initialInput: Input = {
  name: "",
  price: 0,
  categories: [],
  file: undefined,
};

const Menu: React.FC = () => {
  const [input, setInput] = useState<Input>(initialInput);
  const [preview, setPreview] = useState<string>("");
  const [error, setError] = useState("");

  // tRPC hooks
  const { mutateAsync: createPresignedUrl } =
    api.admin.createPresignedUrl.useMutation();
  const { mutateAsync: addItem } = api.admin.addMenuItem.useMutation();
  const { data: menuItems, refetch } = api.menu.getMenuItems.useQuery();
  const { mutateAsync: deleteMenuItem } =
    api.admin.deleteMenuItem.useMutation();

  useEffect(() => {
    if (!input.file) return;
    const objectUrl = URL.createObjectURL(input.file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [input.file]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return setError("No file selected");
    if (file.size > MAX_FILE_SIZE) return setError("File size is too big");
    setError("");
    setInput((prev) => ({ ...prev, file }));
  };

  const handleImageUpload = async (): Promise<string | undefined> => {
    const { file } = input;
    if (!file) return;

    const { fields, key, url } = await createPresignedUrl({
      fileType: file.type,
    });
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    formData.append("Content-Type", file.type);
    formData.append("file", file);

    await fetch(url, { method: "POST", body: formData });
    return key;
  };

  const addMenuItem = async () => {
    const key = await handleImageUpload();
    if (!key) return;

    await addItem({
      name: input.name,
      imageKey: key,
      categories: input.categories.map(
        (c) => c.value as Exclude<Categories, "all">
      ),
      price: input.price,
    });

    refetch();
    setInput(initialInput);
    setPreview("");
  };

  const handleDelete = async (imageKey: string, id: string) => {
    await deleteMenuItem({ id, imageKey });
    refetch();
  };

  return (
    <>
      <div className="mx-auto flex max-w-xl flex-col gap-2">
        <input
          name="name"
          className="h-12 rounded-sm border-none bg-gray-200"
          type="text"
          placeholder="name"
          onChange={(e) =>
            setInput((prev) => ({ ...prev, name: e.target.value }))
          }
          value={input.name}
        />

        <input
          name="price"
          className="h-12 rounded-sm border-none bg-gray-200"
          type="number"
          placeholder="price"
          onChange={(e) =>
            setInput((prev) => ({ ...prev, price: Number(e.target.value) }))
          }
          value={input.price}
        />

        <DynamicSelect
          value={input.categories}
          onChange={(e) =>
            setInput((prev) => ({
              ...prev,
              categories: e as MultiValue<{ value: string; label: string }>, // Explicitly cast to the correct type
            }))
          }
          isMulti
          className="h-12"
          options={selectOptions}
        />

        <label
          htmlFor="file"
          className="relative h-12 cursor-pointer rounded-sm bg-gray-200 font-medium text-indigo-600 focus-within:outline-none"
        >
          <span className="sr-only">File input</span>
          <div className="flex h-full items-center justify-center">
            {preview ? (
              <div className="relative h-3/4 w-full">
                <Image
                  alt="preview"
                  style={{ objectFit: "contain" }}
                  fill
                  src={preview}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </div>
            ) : (
              <span>Select image</span>
            )}
          </div>
          <input
            name="file"
            id="file"
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/jpg"
            type="file"
            className="sr-only"
          />
        </label>

        <button
          className="h-12 rounded-sm bg-gray-200 disabled:cursor-not-allowed"
          disabled={!input.file || !input.name}
          onClick={() => void addMenuItem()}
        >
          Add menu item
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="mx-auto mt-12 max-w-7xl">
        <p className="text-lg font-medium">Your menu items:</p>
        <div className="mt-6 mb-12 grid grid-cols-4 gap-8">
          {menuItems?.map((menuItem) => (
            <div key={menuItem.id}>
              <p>{menuItem.name}</p>
              <div className="relative h-40 w-40">
                <Image
                  priority
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  alt=""
                  src={menuItem.url}
                />
              </div>
              <button
                onClick={() =>
                  void handleDelete(menuItem.imageKey, menuItem.id)
                }
                className="text-xs text-red-500"
              >
                delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Menu;
