export type SizeOptions = 'M' | 'L';
export type SugarOptions = '正常糖' | '少糖' | '半糖' | '微糖' | '無糖';
export type IceOptions = '正常冰' | '少冰' | '微冰' | '去冰' | '熱';

export interface Product {
  id: string;
  name: string;
  engName: string;
  description: string;
  price: { M?: number; L?: number };
  category: string;
  imageUrl?: string;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
}

export const CATEGORIES = ['單品茶', '調飲茶'];

export const TOPPINGS: Topping[] = [
  { id: 't1', name: '白玉', price: 10 },
  { id: 't2', name: '水玉', price: 10 },
  { id: 't3', name: '墨玉', price: 15 },
  { id: 't4', name: '春梅凍', price: 15 },
  { id: 't5', name: '榛果蕎麥凍', price: 15 },
];

export const MENU: Product[] = [
  {
    id: 'p1',
    name: '熟成紅茶',
    engName: 'Signature Black Tea',
    description: '解吃肉的油膩，茶味濃郁果香',
    price: { M: 30, L: 35 },
    category: '單品茶',
  },
  {
    id: 'p2',
    name: '麗春紅茶',
    engName: 'Light Black Tea',
    description: '去除海鮮羶腥，茶味較淡帶花香',
    price: { M: 30, L: 35 },
    category: '單品茶',
  },
  {
    id: 'p3',
    name: '太妃紅茶',
    engName: 'Coffee Black Tea',
    description: '咖啡與紅茶的絕妙組合',
    price: { M: 35, L: 40 },
    category: '單品茶',
  },
  {
    id: 'p4',
    name: '胭脂紅茶',
    engName: 'Peach Black Tea',
    description: '帶有蜜桃韻味的特色紅茶',
    price: { M: 40, L: 45 },
    category: '單品茶',
  },
  {
    id: 'p5',
    name: '春芽綠茶',
    engName: 'Green Tea',
    description: '綠茶，系系品嚐甘甜尾韻',
    price: { M: 30, L: 35 },
    category: '單品茶',
  },
  {
    id: 'p6',
    name: '白玉歐蕾',
    engName: 'Bubble Milk Tea',
    description: '熟成鮮奶茶搭配白玉珍珠',
    price: { M: 50, L: 60 },
    category: '調飲茶',
  },
  {
    id: 'p7',
    name: '熟成檸果',
    engName: 'Lemon Black Tea',
    description: '新鮮檸檬搭配熟成紅茶，酸甜順口',
    price: { M: 50 },
    category: '調飲茶',
  }
];
