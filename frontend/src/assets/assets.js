import bin_icon from "./bin.png";
import call_icon from "./call.png";
import cart_icon from "./cart.png";
import close_icon from "./close.png";
import color_logo from "./colour.png";
import logo_black from "./Logo-black.png";
import search_icon from "./search.png";
import profile_icon from "./profile.png";
import menu_icon from "./menu.png";
import dropdown_icon from "./dropdown.png";
import hero_img from "./Laptop-msi.jpg";
import exchange_icon from './exchange.png';
import bell_icon from './bell.png';
import heart_icon from './heart.png';
import alarm_icon from './alarm.png'
import hero_back from './hero_img.png'
import prod_img1 from "./prod1.jpg";
import prod_img2 from "./prod2.jpg";
import prod_img3 from "./prod3.jpg";
import prod_img4 from "./prod4.jpg";
import prod_img5 from "./prod5.jpg";
import prod_img6 from "./prod6.jpg";
import prod_img7 from "./prod7.jpg";
import dell_img from './dell.png'
import hp_img from './hp.png'
import apple_img from './apple.png'
import lenovo_img from './lenovo.png'
import logi2_img from './logi2.png'
import logi_img from './logoi.png'
import headset_img from './headset.jpg'
import woman_img from './woman.jpg'
import delivery_img from './delivery.png'
import samp_img from './samp.png'
import samp_img2 from './samp1.png'
import samp_img3 from './samp3.png'
import blog_img1 from './blogImg1.png'
import blog_img2 from './blogImg2.png'
import blog_img3 from './blogImg3.png'
import error_back from './errorBac.png'
import empty_img from './emptyCart.png'

export const assets = {
  bin_icon,
  call_icon,
  cart_icon,
  close_icon,
  color_logo,
  logo_black,
  search_icon,
  profile_icon,
  menu_icon,
  dropdown_icon,
  hero_back,
  exchange_icon,
  bell_icon,
  heart_icon,
  alarm_icon,
  hero_img,
  headset_img,
  woman_img,
  delivery_img,
  samp_img,
  samp_img2,
  samp_img3,
  blog_img1,
  blog_img2,
  blog_img3,
  error_back,
  empty_img,

  dell_img,
  hp_img,
  apple_img,
  lenovo_img,
  logi2_img,
  logi_img,

  prod_img1,
  prod_img2,
  prod_img3,
  prod_img4,
  prod_img5,
  prod_img6,
  prod_img7

};

export const products = [
  // Laptops
  {
    _id: "pc-l1",
    name: "Dell XPS 15",
    description: "High performance laptop with stunning display",
    price: 3500000,
    image: [prod_img1],
    category: "PC",
    subCategory: "Laptops",
    rating: 5,
    quantity: 25,
    unitsLeft: 7,
    ram: "16GB",
    storage: "512GB SSD",
    processor: "Intel Core i7",
  },
  {
    _id: "pc-l2",
    name: "HP Spectre x360",
    description: "Convertible laptop with OLED touchscreen",
    price: 2900000,
    image: [prod_img2],
    category: "PC",
    subCategory: "Laptops",
    rating: 4,
    quantity: 20,
    unitsLeft: 12,
    ram: "16GB",
    storage: "1TB SSD",
    processor: "Intel Core i7",
  },
  {
    _id: "pc-l3",
    name: "MacBook Pro M2",
    description: "Apple Silicon MacBook with blazing speed",
    price: 4800000,
    image: [prod_img3],
    category: "PC",
    subCategory: "Laptops",
    rating: 5,
    quantity: 30,
    unitsLeft: 15,
    ram: "16GB",
    storage: "1TB SSD",
    processor: "Apple M2",
  },
  {
    _id: "pc-l4",
    name: "Lenovo Legion 5",
    description: "Gaming laptop with RTX 3060",
    price: 2700000,
    image: [prod_img4],
    category: "PC",
    subCategory: "Laptops",
    rating: 4,
    quantity: 18,
    unitsLeft: 4,
    ram: "16GB",
    storage: "512GB SSD",
    processor: "AMD Ryzen 7",
  },
  {
    _id: "pc-l5",
    name: "Asus ZenBook 14",
    description: "Portable ultrabook for productivity",
    price: 1850000,
    image: [prod_img5],
    category: "PC",
    subCategory: "Laptops",
    rating: 4,
    quantity: 10,
    unitsLeft: 2,
    ram: "8GB",
    storage: "256GB SSD",
    processor: "Intel Core i5",
  },
  {
    _id: "pc-l6",
    name: "Acer Swift 3",
    description: "Lightweight laptop for students",
    price: 1450000,
    image: [prod_img6],
    category: "PC",
    subCategory: "Laptops",
    rating: 3,
    quantity: 22,
    unitsLeft: 9,
    ram: "8GB",
    storage: "512GB SSD",
    processor: "Intel Core i3",
  },
  {
    _id: "pc-l7",
    name: "MSI Katana GF66",
    description: "Gaming laptop with fast refresh display",
    price: 2100000,
    image: [prod_img7],
    category: "PC",
    subCategory: "Laptops",
    rating: 4,
    quantity: 16,
    unitsLeft: 6,
    ram: "16GB",
    storage: "512GB SSD",
    processor: "Intel Core i7",
  },
  {
    _id: "pc-l8",
    name: "Huawei MateBook D14",
    description: "Compact laptop with AMD processor",
    price: 1650000,
    image: [prod_img3],
    category: "PC",
    subCategory: "Laptops",
    rating: 3,
    quantity: 14,
    unitsLeft: 5,
    ram: "8GB",
    storage: "512GB SSD",
    processor: "AMD Ryzen 5",
  },
  {
    _id: "pc-l9",
    name: "Samsung Galaxy Book 2",
    description: "Slim and fast laptop",
    price: 2050000,
    image: [prod_img5],
    category: "PC",
    subCategory: "Laptops",
    rating: 4,
    quantity: 17,
    unitsLeft: 3,
    ram: "8GB",
    storage: "256GB SSD",
    processor: "Intel Core i5",
  },
  {
    _id: "pc-l10",
    name: "LG Gram 17",
    description: "Large display with ultra-light build",
    price: 3350000,
    image: [prod_img7],
    category: "PC",
    subCategory: "Laptops",
    rating: 5,
    quantity: 20,
    unitsLeft: 11,
    ram: "16GB",
    storage: "1TB SSD",
    processor: "Intel Core i7",
  },
  {
    _id: "pc-l11",
    name: "Dell Inspiron 14",
    description: "Reliable daily use laptop",
    price: 1550000,
    image: [prod_img1],
    category: "PC",
    subCategory: "Laptops",
    rating: 3,
    quantity: 13,
    unitsLeft: 2,
    ram: "8GB",
    storage: "512GB SSD",
    processor: "Intel Core i5",
  },

  // Monitors
  {
    _id: "monitor-1",
    name: "Samsung 27'' Curved Monitor",
    description: "Full HD display for immersive experience",
    price: 110000,
    image: [prod_img5],
    category: "Monitor",
    subCategory: "Flatscreen",
    rating: 4,
    quantity: 50,
    unitsLeft: 25,
  },
  {
    _id: "monitor-2",
    name: "LG UltraFine 4K",
    description: "Exceptional color accuracy",
    price: 350000,
    image: [prod_img6],
    category: "Monitor",
    subCategory: "Flatscreen",
    rating: 5,
    quantity: 30,
    unitsLeft: 10,
  },
  {
    _id: "monitor-3",
    name: "Dell 24'' IPS Display",
    description: "Reliable performance for professionals",
    price: 95000,
    image: [prod_img2],
    category: "Monitor",
    subCategory: "Flatscreen",
    rating: 4,
    quantity: 40,
    unitsLeft: 14,
  },
  {
    _id: "monitor-4",
    name: "HP 23.8'' Full HD",
    description: "Great for both work and play",
    price: 88000,
    image: [prod_img6],
    category: "Monitor",
    subCategory: "Flatscreen",
    rating: 3,
    quantity: 35,
    unitsLeft: 9,
  },
  {
    _id: "monitor-5",
    name: "Acer Nitro 27'' Gaming Monitor",
    description: "165Hz refresh rate with FreeSync",
    price: 160000,
    image: [prod_img1],
    category: "Monitor",
    subCategory: "Flatscreen",
    rating: 5,
    quantity: 28,
    unitsLeft: 6,
  },
];


export const testimonials = [
  {
    _id: "a1a1a1",
    name: "katherin Moss",
    testimony: "new testimony from this user",
    image: [prod_img1],
    date: "2023-10-01",
    rating: 4,
  },
  {
    _id: "a1a1a1",
    name: "katherin Moss",
    testimony: "new testimony from this user",
    image: [prod_img1],
    date: "2023-10-01",
    rating: 4,
  },
  {
    _id: "a1a1a1",
    name: "katherin Moss",
    testimony: "new testimony from this user",
    image: [prod_img1],
    date: "2023-10-01",
    rating: 4,
  },
  {
    _id: "a1a1a1",
    name: "katherin Moss",
    testimony: "new testimony from this user",
    image: [prod_img1],
    date: "2023-10-01",
    rating: 4,
  },
  {
    _id: "a1a1a1",
    name: "katherin Moss",
    testimony: "new testimony from this user",
    image: [prod_img1],
    date: "2023-10-01",
    rating: 4,
  },
  {
    _id: "a1a1a1",
    name: "katherin Moss",
    testimony: "new testimony from this user",
    image: [prod_img1],
    date: "2023-10-01",
    rating: 4,
  },
  {
    _id: "a1a1a1",
    name: "katherin Moss",
    testimony: "new testimony from this user",
    image: [prod_img1],
    date: "2023-10-01",
    rating: 4,
  },

]

export const blogs = [
  {
    _id:"aw111",
    title: "UX review presentations",
    author: "Olivia Rrye",
    date: "20 Jan 2024",
    description: "How do you create compelling presentations that wow your colleagues and impress your managers?",
    tags: ["Design", "Research", "Presentation"],
    image: blog_img1
  },
  {
    _id:"aw111",
    title: "UX review presentations",
    author: "Olivia Rrye",
    date: "20 Jan 2024",
    description: "How do you create compelling presentations that wow your colleagues and impress your managers?",
    tags: ["Design", "Research", "Presentation"],
    image: blog_img2
  },
  {
    _id:"aw111",
    title: "UX review presentations",
    author: "Olivia Rrye",
    date: "20 Jan 2024",
    description: "How do you create compelling presentations that wow your colleagues and impress your managers?",
    tags: ["Design", "Research", "Presentation"],
    image: blog_img3
  },
  {
    _id:"aw111",
    title: "UX review presentations",
    author: "Olivia Rrye",
    date: "20 Jan 2024",
    description: "How do you create compelling presentations that wow your colleagues and impress your managers?",
    tags: ["Design", "Research", "Presentation"],
    image: blog_img1
  },
  {
    _id:"aw111",
    title: "UX review presentations",
    author: "Olivia Rrye",
    date: "20 Jan 2024",
    description: "How do you create compelling presentations that wow your colleagues and impress your managers?",
    tags: ["Design", "Research", "Presentation"],
    image: blog_img3
  },
]

export const productBrands = [
  "Apple", "Dell", "HP", "Lenovo", "Logitech", "Samsung", "Microsoft", "Asus", "Acer", "Razer"
]

export const processorType = [
  "Intel Core i3", "Intel Core i5", "Intel Core i7", "AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7", "Apple M1", "Apple M2"
]

export const ramSize = [
  "4GB", "8GB", "16GB", "32GB", "64GB"
]

export const storageSize = [
  "128GB", "256GB", "512GB", "1TB", "2TB"
]

export const rating = [
  { value: 1, label: "1 Star" },
  { value: 2, label: "2 Stars" },
  { value: 3, label: "3 Stars" },
  { value: 4, label: "4 Stars" },
  { value: 5, label: "5 Stars" },
]

export const graphicsCard = [
  "NVIDIA GeForce GTX 1650",
  "NVIDIA GeForce GTX 1660",
  "NVIDIA GeForce RTX 2060",
  "NVIDIA GeForce RTX 3060",
  "AMD Radeon RX 5500M",
  "AMD Radeon RX 5600M",
  "Intel Iris Xe Graphics",
]
