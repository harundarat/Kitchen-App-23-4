import React, { useState, useContext, useEffect } from "react";
import Card from "../components/common/Card";
import Accordion from "../components/layouts/Accordion";
import { Icon } from "@iconify/react";
import { useLocation, useParams } from "react-router-dom";
import { Sidebar, Checkbox, Label, Pagination } from "flowbite-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  AdditionalInfoContext,
  AdditionalInfoProvider,
} from "../context/additionalInfoContext";
import InputWbtn from "../components/common/InputWbtn";

export default function Search() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="mx-auto box-border flex min-h-svh w-full min-w-[360px] max-w-[1080px] flex-col gap-5 px-5 py-24 md:flex-row lg:mx-auto lg:px-0">
      <AdditionalInfoProvider>
        <SidebarFilter />
      </AdditionalInfoProvider>
      <section className="mt-4 w-full">
        <header className="mb-6 flex flex-col gap-4">
          <h1 className="line-clamp-1 w-full font-medium text-primary">
            {`Menampilkan Hasil Pencarian "${searchParams().recipe ? decodeURIComponent(searchParams().recipe) : "All"}"`}
          </h1>
          <div className="flex flex-wrap gap-2">
            {searchParams().category?.length > 0 &&
              searchParams().category.map((category, index) => (
                <span
                  key={index}
                  className="inline-block rounded-full border border-gray-400 bg-bg px-3 py-1 text-xs font-medium text-primary"
                >
                  {decodeURIComponent(category)}
                </span>
              ))}
            {searchParams().ingredients?.length > 0 &&
              searchParams().ingredients.map((ingredients, index) => (
                <span
                  key={index}
                  className="inline-block rounded-full border border-gray-400 bg-bg px-3 py-1 text-xs font-medium text-primary"
                >
                  {decodeURIComponent(ingredients)}
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
  const urlSearchParams = new URLSearchParams(useLocation().search);
  const [resultSearch, setResultSearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const urlSearch = urlSearchParams.toString();
  const urlEndpoint = urlSearch.replace("recipe=", "search=");

  useEffect(() => {
    const fetchSearch = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/recipes?${urlEndpoint}&limit=12`);
        setResultSearch(data);
      } catch (error) {
        console.error(error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();
  }, [useLocation().search]);

  if (loading || error) {
    if (error) {
      toast.error("Terjadi kesalahan saat memuat data");
    }
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
      {resultSearch.recipes?.length === 0 ? (
        <div className="mb-4 mt-16 flex flex-col items-center justify-center text-gray-400">
          <Icon icon="hugeicons:album-not-found-01" width={50} />
          <h1 className="text-lg font-medium">Resep tidak ditemukan</h1>
          <p className="text-sm">Coba gunakan kata kunci lain</p>
        </div>
      ) : (
        <>
          <div className="mx-auto mt-2 grid w-full grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3">
            {resultSearch.recipes?.map((item, index) => (
              <Card
                key={index}
                id={item._id}
                tittle={item.title}
                image={item.image}
                time={item.total_time}
                likes={item.likes}
                creatorName={item.user?.fullName || item.user_id?.fullName}
                creatorImage={item.user?.image || item.user_id?.image}
              />
            ))}
          </div>
          <SearchPagination totalPages={resultSearch.totalPages} />
        </>
      )}
    </>
  );
}

function SearchPagination({ totalPages }) {
  const navigate = useNavigate();
  const urlSearchParams = new URLSearchParams(useLocation().search);
  const page = parseInt(urlSearchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(page);
  const onPageChange = (page) => {
    setCurrentPage(page);
    urlSearchParams.set("page", page);
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
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        showIcons
      />
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-500">
          Halaman saat ini <strong>{currentPage}</strong>
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
  const params = searchParams();
  const navigate = useNavigate();
  const { additionalInfo } = useContext(AdditionalInfoContext);
  const [filter, setFilter] = useState({
    category: params.category,
    ingredients: params.ingredients,
  });
  const [checkedCategories, setCheckedCategories] = useState(
    additionalInfo?.kategori?.reduce((acc, category) => {
      acc[category.title] = false;
      return acc;
    }, {}),
  );
  const [toggleFilter, setToggleFilter] = useState(false);

  useEffect(() => {
    filter.category.map((category) => {
      setCheckedCategories((prevCheckedCategories) => ({
        ...prevCheckedCategories,
        [category]: true,
      }));
    });
  }, [filter]);

  const handleCheckboxChange = (event) => {
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

  const handleBahan = (bahan) => [
    setFilter((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, bahan],
    })),
  ];
  const handleRemoveBahan = (bahan) => {
    setFilter((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((item) => item !== bahan),
    }));
  };

  const terapkanFilter = () => {
    setFilter((prev) => ({
      ...prev,
      category: getCheckedCategories(),
    }));
    // console.log(filter);
    const encode = {
      recipe: encodeURIComponent(params.recipe),
      category: encodeURIComponent(getCheckedCategories().join(",")),
      ingredients: encodeURIComponent(filter.ingredients.join(",")),
      page: 1,
    };
    const query = {
      recipe: params.recipe ? `recipe=${encode.recipe}` : "",
      category:
        getCheckedCategories().length > 0 ? `category=${encode.category}` : "",
      ingredients:
        filter.ingredients.length > 0
          ? `ingredients=${encode.ingredients}`
          : "",
      page: 1,
    };
    // console.log(query.ingredients);
    const querySearch =
      (query.recipe ? `${query.recipe}&` : "") +
      (query.category ? `${query.category}&` : "") +
      (query.ingredients ? `${query.ingredients}&` : "");

    navigate(`/search?${querySearch}page=${query.page}`);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const handleToggleFilter = (e) => {
    e.stopPropagation();
    if (window.innerWidth < 768) {
      setToggleFilter(!toggleFilter);
    }
  };

  return (
    <>
      <Sidebar
        aria-label="sidebar-filter"
        className="mt-4 w-full select-none rounded-lg border border-gray-300 bg-gray-100 shadow md:h-fit md:max-w-[255px]"
      >
        <Sidebar.Items>
          {/* Filter Header */}
          <Sidebar.ItemGroup
            onClick={(e) => handleToggleFilter(e)}
            className="m-0 cursor-pointer border-none p-0 md:cursor-default"
          >
            <Sidebar.Item className="justify-start hover:bg-gray-200 md:hover:bg-gray-100">
              <div className="flex items-center gap-2">
                <Icon className="text-primary" icon="uil:filter" width={22} />
                <h1 className="font-semibold">Filter</h1>
                <Icon
                  className="ml-auto text-primary md:hidden"
                  icon="mingcute:down-fill"
                  width={19}
                />
              </div>
            </Sidebar.Item>
          </Sidebar.ItemGroup>
          <hr
            className={`my-2 ${toggleFilter ? "block" : "hidden"} border border-gray-200 md:block`}
          />
          {/* Filter Berdasarkan Kategori */}
          <Sidebar.ItemGroup
            className={`m-0 ${toggleFilter ? "block" : "hidden"} border-none p-0 md:block`}
          >
            <Sidebar.Collapse
              className="gap-4 font-medium hover:bg-gray-200"
              label="Berdasarkan Kategori"
            >
              {additionalInfo?.kategori.map((kat, i) => (
                <Sidebar.Item key={i} className="ml-2 justify-start">
                  <div key={i} className="flex items-center gap-2">
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
                </Sidebar.Item>
              ))}
            </Sidebar.Collapse>
          </Sidebar.ItemGroup>
          <hr
            className={`my-2 ${toggleFilter ? "block" : "hidden"} border border-gray-200 md:block`}
          />
          {/* Filter Berdasarkan Bahan */}
          <Sidebar.ItemGroup
            className={`m-0 ${toggleFilter ? "block" : "hidden"} border-none p-0 md:block`}
          >
            <Sidebar.Item className="justify-start">
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
            </Sidebar.Item>
          </Sidebar.ItemGroup>
          <hr
            className={`my-2 ${toggleFilter ? "block" : "hidden"} border border-gray-200 md:block`}
          />
          {/* Button Terapkan */}
          <Sidebar.ItemGroup
            className={`m-0 ${toggleFilter ? "block" : "hidden"} border-none p-0 md:block`}
          >
            <Sidebar.Item>
              <button
                className="rounded-full border border-gray-300 bg-primary px-4 py-2 text-bg shadow-sm hover:bg-opacity-90 active:scale-95"
                onClick={() => terapkanFilter()}
              >
                Terapkan
              </button>
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    </>
  );
}

function Autocomplete({ data, onDone }) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = (value) => {
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

  const handleSuggestionClick = (suggestion) => {
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
        onClick={(value) => handleDone()}
        required
      />
      {showSuggestions && (
        <ul className="absolute z-50 mt-2 w-52 list-none overflow-hidden rounded-lg bg-bg shadow-lg">
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

function searchParams() {
  const urlSearchParams = new URLSearchParams(useLocation().search);
  const category = urlSearchParams.get("category");
  const ingredients = urlSearchParams.get("ingredients");
  const search = {
    recipe: urlSearchParams.get("recipe"),
    category: category ? category.split(",") : [],
    ingredients: ingredients ? ingredients.split(",") : [],
    page: urlSearchParams.get("page"),
  };
  return search;
}
