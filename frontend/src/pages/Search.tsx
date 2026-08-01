import { useState, useEffect, type ChangeEvent, type MouseEvent } from "react";
import Card from "../components/common/Card";
import { Icon } from "@iconify/react";
import { useLocation } from "react-router-dom";
import {
  Checkbox,
  Label,
  Pagination,
  Sidebar,
  SidebarCollapse,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
} from "flowbite-react";
import { toast } from "react-hot-toast";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAdditionalInfo } from "../context/additionalInfoContext";
import InputWbtn from "../components/common/InputWbtn";
import type { RecipesResponse } from "../types/api";

export default function Search() {
  const params = useParsedSearchParams();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="mx-auto box-border flex min-h-svh w-full max-w-[1080px] min-w-[360px] flex-col gap-5 px-5 py-24 md:flex-row lg:mx-auto lg:px-0">
      <SidebarFilter />
      <section className="mt-4 w-full">
        <header className="mb-6 flex flex-col gap-4">
          <h1 className="text-primary line-clamp-1 w-full font-medium">
            {`Menampilkan Hasil Pencarian "${params.recipe || "All"}"`}
          </h1>
          <div className="flex flex-wrap gap-2">
            {params.category.length > 0 &&
              params.category.map((category) => (
                <span
                  key={category}
                  className="bg-bg text-primary inline-block rounded-full border border-gray-400 px-3 py-1 text-xs font-medium"
                >
                  {category}
                </span>
              ))}
            {params.ingredients.length > 0 &&
              params.ingredients.map((ingredient) => (
                <span
                  key={ingredient}
                  className="bg-bg text-primary inline-block rounded-full border border-gray-400 px-3 py-1 text-xs font-medium"
                >
                  {ingredient}
                </span>
              ))}
          </div>
        </header>
        <ResultSearch />
      </section>
    </main>
  );
}

function ResultSearch() {
  const location = useLocation();
  const urlSearchParams = new URLSearchParams(location.search);
  const [resultSearch, setResultSearch] = useState<RecipesResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const urlSearch = urlSearchParams.toString();
  const urlEndpoint = urlSearch.replace("recipe=", "search=");

  useEffect(() => {
    const fetchSearch = async () => {
      try {
        setLoading(true);
        const data = await api.get<RecipesResponse>(
          `/recipes?${urlEndpoint}&limit=12`,
        );
        setResultSearch(data);
      } catch (error) {
        console.error(error);
        setError(error);
        toast.error("Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();
  }, [location.search, urlEndpoint]);

  if (loading || error) {
    return (
      <div className="mx-auto mt-2 grid w-full grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3">
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
      </div>
    );
  }

  return (
    <>
      {!resultSearch?.recipes.length ? (
        <div className="mt-16 mb-4 flex flex-col items-center justify-center text-gray-400">
          <Icon icon="hugeicons:album-not-found-01" width={50} />
          <h1 className="text-lg font-medium">Resep tidak ditemukan</h1>
          <p className="text-sm">Coba gunakan kata kunci lain</p>
        </div>
      ) : (
        <>
          <div className="mx-auto mt-2 grid w-full grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3">
            {resultSearch.recipes.map((item) => (
              <Card
                key={item._id}
                id={item._id}
                title={item.title}
                image={item.image}
                time={item.totalTime}
                likes={item.likeCount}
                creatorName={item.author?.fullName}
                creatorImage={item.author?.image}
              />
            ))}
          </div>
          <SearchPagination totalPages={resultSearch.pagination.totalPages} />
        </>
      )}
    </>
  );
}

function SearchPagination({ totalPages }: { totalPages: number }) {
  const navigate = useNavigate();
  const urlSearchParams = new URLSearchParams(useLocation().search);
  const page = Number(urlSearchParams.get("page")) || 1;
  const onPageChange = (nextPage: number) => {
    urlSearchParams.set("page", String(nextPage));
    navigate(`/search?${urlSearchParams.toString()}`);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="mt-10 flex flex-col items-center justify-center gap-4 overflow-x-auto">
      <Pagination
        layout="navigation"
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        showIcons
      />
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-500">
          Halaman saat ini <strong>{page}</strong>
        </p>
        <p className="text-sm text-gray-500">-</p>
        <p className="text-sm text-gray-400">
          Total Halaman <strong>{totalPages}</strong>
        </p>
      </div>
    </div>
  );
}

function SidebarFilter() {
  const location = useLocation();
  const params = useParsedSearchParams();
  const navigate = useNavigate();
  const { additionalInfo } = useAdditionalInfo();
  const [filter, setFilter] = useState({
    category: params.category,
    ingredients: params.ingredients,
  });
  const [checkedCategories, setCheckedCategories] = useState<
    Record<string, boolean>
  >(
    () =>
      Object.fromEntries(
        params.category.map((category) => [category, true]),
      ) as Record<string, boolean>,
  );
  const [toggleFilter, setToggleFilter] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const category = searchParams.get("category")?.split(",") ?? [];
    const ingredients = searchParams.get("ingredients")?.split(",") ?? [];

    setFilter({ category, ingredients });
    setCheckedCategories(
      Object.fromEntries(category.map((item) => [item, true])),
    );
  }, [location.search]);

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setCheckedCategories((prevCheckedCategories) => ({
      ...prevCheckedCategories,
      [name]: checked,
    }));
  };

  const getCheckedCategories = () => {
    if (!checkedCategories) return [];
    return Object.keys(checkedCategories).filter(
      (category) => checkedCategories[category],
    );
  };

  const handleBahan = (bahan: string) =>
    setFilter((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, bahan],
    }));
  const handleRemoveBahan = (bahan: string) => {
    setFilter((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((item) => item !== bahan),
    }));
  };

  const terapkanFilter = () => {
    const query = new URLSearchParams({ page: "1" });
    if (params.recipe) query.set("recipe", params.recipe);
    if (getCheckedCategories().length) {
      query.set("category", getCheckedCategories().join(","));
    }
    if (filter.ingredients.length) {
      query.set("ingredients", filter.ingredients.join(","));
    }

    navigate(`/search?${query.toString()}`);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const handleToggleFilter = (e: MouseEvent) => {
    e.stopPropagation();
    if (window.innerWidth < 768) {
      setToggleFilter(!toggleFilter);
    }
  };

  return (
    <>
      <Sidebar
        aria-label="sidebar-filter"
        className="mt-4 w-full rounded-lg border border-gray-300 bg-gray-100 shadow select-none md:h-fit md:max-w-[255px]"
      >
        <SidebarItems>
          {/* Filter Header */}
          <SidebarItemGroup
            onClick={(e) => handleToggleFilter(e)}
            className="m-0 cursor-pointer border-none p-0 md:cursor-default"
          >
            <SidebarItem className="justify-start hover:bg-gray-200 md:hover:bg-gray-100">
              <div className="flex items-center gap-2">
                <Icon className="text-primary" icon="uil:filter" width={22} />
                <h1 className="font-semibold">Filter</h1>
                <Icon
                  className="text-primary ml-auto md:hidden"
                  icon="mingcute:down-fill"
                  width={19}
                />
              </div>
            </SidebarItem>
          </SidebarItemGroup>
          <hr
            className={`my-2 ${toggleFilter ? "block" : "hidden"} border border-gray-200 md:block`}
          />
          {/* Filter Berdasarkan Kategori */}
          <SidebarItemGroup
            className={`m-0 ${toggleFilter ? "block" : "hidden"} border-none p-0 md:block`}
          >
            <SidebarCollapse
              className="gap-4 font-medium hover:bg-gray-200"
              label="Berdasarkan Kategori"
            >
              {additionalInfo?.kategori.map((kat, i) => (
                <SidebarItem
                  key={kat._id ?? kat.title}
                  className="ml-2 justify-start"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`kat-${i}`}
                      name={kat.title}
                      checked={
                        checkedCategories ? checkedCategories[kat.title] : false
                      }
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor={`kat-${i}`}>{kat.title}</Label>
                  </div>
                </SidebarItem>
              ))}
            </SidebarCollapse>
          </SidebarItemGroup>
          <hr
            className={`my-2 ${toggleFilter ? "block" : "hidden"} border border-gray-200 md:block`}
          />
          {/* Filter Berdasarkan Bahan */}
          <SidebarItemGroup
            className={`m-0 ${toggleFilter ? "block" : "hidden"} border-none p-0 md:block`}
          >
            <SidebarItem className="justify-start">
              <div className="flex flex-col gap-4">
                <h1 className="font-medium">Berdasarkan Bahan</h1>
                <Autocomplete
                  data={additionalInfo?.bahan || []}
                  onDone={(value) => handleBahan(value)}
                />
                <div className="flex flex-col gap-2">
                  {filter.ingredients.map((bahan, i) => (
                    <div
                      key={i}
                      className="flex justify-between gap-2 border px-2 py-1"
                    >
                      <h1 className="line-clamp-1 max-w-full">{bahan}</h1>
                      <button onClick={() => handleRemoveBahan(bahan)}>
                        <Icon icon="iconoir:cancel" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </SidebarItem>
          </SidebarItemGroup>
          <hr
            className={`my-2 ${toggleFilter ? "block" : "hidden"} border border-gray-200 md:block`}
          />
          {/* Button Terapkan */}
          <SidebarItemGroup
            className={`m-0 ${toggleFilter ? "block" : "hidden"} border-none p-0 md:block`}
          >
            <SidebarItem>
              <button
                className="bg-primary text-bg hover:bg-opacity-90 rounded-full border border-gray-300 px-4 py-2 shadow-sm active:scale-95"
                onClick={() => terapkanFilter()}
              >
                Terapkan
              </button>
            </SidebarItem>
          </SidebarItemGroup>
        </SidebarItems>
      </Sidebar>
    </>
  );
}

function Autocomplete({
  data,
  onDone,
}: {
  data: string[];
  onDone: (value: string) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = (value: string) => {
    // const value = e.target.value;
    setInputValue(value);

    if (value.length > 0) {
      const filteredSuggestions = data.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase()),
      );
      setSuggestions(filteredSuggestions.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
  };

  const handleDone = () => {
    if (!inputValue) {
      toast.error("Masukan bahan terlebih dahulu");
      return;
    }
    onDone(inputValue);
    setInputValue("");
  };

  return (
    <div className="">
      <InputWbtn
        type="text"
        iconify="entypo:check"
        value={inputValue}
        onChange={(value) => handleChange(value)}
        placeholder="Pilih bahan..."
        onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
        onClick={handleDone}
        required
      />
      {showSuggestions && (
        <ul className="bg-bg absolute z-50 mt-2 w-52 list-none overflow-hidden rounded-lg shadow-lg">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="cursor-pointer border p-2 hover:bg-gray-200"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function useParsedSearchParams() {
  const location = useLocation();
  const urlSearchParams = new URLSearchParams(location.search);
  const category = urlSearchParams.get("category");
  const ingredients = urlSearchParams.get("ingredients");
  const search = {
    recipe: urlSearchParams.get("recipe") ?? "",
    category: category ? category.split(",") : [],
    ingredients: ingredients ? ingredients.split(",") : [],
    page: urlSearchParams.get("page") ?? "1",
  };
  return search;
}
