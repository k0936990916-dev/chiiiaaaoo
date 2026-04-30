import { useState } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { MENU, CATEGORIES, Product, SizeOptions, SugarOptions, IceOptions, TOPPINGS, Topping } from '../data';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Plus, Minus, X, Coffee } from 'lucide-react';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  size: SizeOptions;
  sugar: SugarOptions;
  ice: IceOptions;
  toppings: Topping[];
  quantity: number;
}

const RusticFlower = () => (
  <svg viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[300px] h-auto lg:w-[400px] opacity-20">
    {/* Abstract Tea Branch Silhouette */}
    <path d="M100 280 C100 280, 85 200, 110 150 C135 100, 170 80, 180 50 C180 50, 160 60, 140 90 C120 120, 115 160, 100 200" stroke="#A73C3C" strokeWidth="2" strokeLinecap="round" />
    <path d="M110 150 C110 150, 150 130, 170 140 C190 150, 195 180, 180 190 C165 200, 130 180, 110 150" stroke="#A73C3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M110 150 C110 150, 140 160, 180 190" stroke="#A73C3C" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 5" />
    <path d="M105 200 C105 200, 60 180, 40 160 C20 140, 20 100, 30 80 C40 60, 80 80, 105 130" stroke="#A73C3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M105 200 C105 200, 70 160, 30 80" stroke="#A73C3C" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 5" />
    
    <circle cx="180" cy="50" r="3" fill="#A73C3C" />
    <circle cx="30" cy="80" r="2.5" fill="#A73C3C" />
    <circle cx="20" cy="220" r="2" fill="#A73C3C" />
    <circle cx="160" cy="260" r="2" fill="#A73C3C" opacity="0.6" />
    <circle cx="120" cy="240" r="1.5" fill="#A73C3C" opacity="0.6" />
    <circle cx="60" cy="120" r="1.5" fill="#A73C3C" opacity="0.8" />
  </svg>
);

export default function Frontend({ user }: { user: User | null }) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!user) {
      alert("請先登入！");
      return;
    }
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const orderData = {
        ownerId: user.uid,
        customerName: user.displayName || user.email?.split('@')[0] || 'Guest',
        status: 'pending',
        items: cart.map(i => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          size: i.size,
          sugar: i.sugar,
          ice: i.ice,
          toppings: i.toppings
        })),
        totalAmount: cartTotal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const ordersRef = collection(db, 'orders');
      await addDoc(ordersRef, orderData);
      
      setCart([]);
      setIsCartOpen(false);
      alert('訂單建立成功！');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
      alert('建立失敗，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      
      <div className="text-center mb-16">
        <h2 className="text-xl md:text-2xl tracking-[0.5em] text-[#A73C3C] mb-4">菜單</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-2 border transition-all text-sm tracking-widest font-sans",
                activeCategory === cat 
                  ? "border-[#A73C3C] text-[#FFFDF9] bg-[#A73C3C]" 
                  : "border-[#A73C3C] text-[#A73C3C] hover:bg-[#A73C3C]/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col md:flex-row gap-16 justify-between items-start max-w-5xl px-4 relative z-10">
        {/* Product List */}
        <div className="flex-1 w-full space-y-12">
          {MENU.filter(p => p.category === activeCategory).map(product => (
             <div 
               key={product.id} 
               onClick={() => setSelectedProduct(product)}
               className="group cursor-pointer relative"
             >
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="text-xl md:text-2xl tracking-widest text-[#5C3D2E] font-medium group-hover:text-[#A73C3C] transition-colors">{product.name}</h4>
                  </div>
                  <div className="text-[#5C3D2E] tracking-widest font-sans font-light text-sm md:text-base">
                    {product.price.M && <span>中：{product.price.M} </span>}
                    {product.price.M && product.price.L && <span className="mx-2">/</span>}
                    {product.price.L && <span>大：{product.price.L}</span>}
                  </div>
                </div>
                <p className="text-[#A73C3C]/70 text-xs md:text-sm tracking-widest mb-4 font-sans font-light">{product.description}</p>
                <div className="w-full h-px bg-[#A73C3C]/30"></div>
             </div>
          ))}
        </div>

        {/* Right Side Illustration */}
        <div className="hidden lg:flex flex-col items-center justify-start w-[400px] sticky top-24">
           <RusticFlower />
        </div>
      </div>

      {/* Floating Cart Button */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#A73C3C] border-4 border-[#5C3D2E] text-[#FFFDF9] rounded-full flex flex-col items-center justify-center shadow-xl z-40 hover:scale-110 transition-transform font-sans"
      >
        <span className="text-[10px] font-bold tracking-widest leading-none mb-1">CART</span>
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 border-2 border-[#5C3D2E] text-white rounded-full flex items-center justify-center text-xs font-bold font-mono">
            {cart.length}
          </span>
        )}
      </button>

      {/* Desktop/Mobile Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-[#5C3D2E]/80 backdrop-blur-sm z-50 cursor-pointer"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-[#FFFDF9] z-50 shadow-2xl flex flex-col font-sans text-[#5C3D2E]"
            >
               <div className="bg-[#A73C3C] text-[#FFFDF9] p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold tracking-widest uppercase">My Order</h3>
                <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-[#FFFDF9]/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#A73C3C]/50 space-y-4 font-serif text-center">
                    <Coffee className="w-16 h-16 opacity-50" strokeWidth={1} />
                    <p className="tracking-widest">您的購物車尚無茶飲</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="border-b border-[#5C3D2E]/10 pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-[#5C3D2E] text-lg">{item.name}</h4>
                        <button 
                          onClick={() => setCart(c => c.filter(i => i.id !== item.id))}
                          className="text-[#5C3D2E]/30 hover:text-red-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-sm text-[#5C3D2E]/60 tracking-widest">
                        {item.size} / {item.sugar} / {item.ice}
                      </div>
                      {item.toppings.length > 0 && (
                        <div className="text-xs text-[#5C3D2E]/60 mb-3 tracking-widest mt-1">
                          + {item.toppings.map(t => t.name).join(', ')}
                        </div>
                      )}
                      {item.toppings.length === 0 && <div className="mb-3"></div>}
                      <div className="flex justify-between items-center">
                        <div className="text-[#5C3D2E] font-mono font-bold text-xl">${item.price * item.quantity}</div>
                        <div className="flex items-center gap-3 border border-[#A73C3C]/30 rounded-md p-1">
                          <button 
                            onClick={() => setCart(c => c.map(i => i.id === item.id ? {...i, quantity: Math.max(1, i.quantity - 1)} : i))}
                            className="w-8 h-8 flex items-center justify-center text-[#5C3D2E] hover:bg-[#A73C3C]/10 rounded transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-medium text-[#5C3D2E]">{item.quantity}</span>
                          <button 
                            onClick={() => setCart(c => c.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i))}
                            className="w-8 h-8 flex items-center justify-center text-[#5C3D2E] hover:bg-[#A73C3C]/10 rounded transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-6 bg-white border-t border-[#5C3D2E]/10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between mb-6 text-[#5C3D2E]">
                  <span className="font-bold tracking-widest">總計</span>
                  <span className="font-bold font-mono text-3xl">${cartTotal}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || isSubmitting}
                  className="w-full bg-[#5C3D2E] text-[#FFFDF9] py-4 font-bold tracking-[0.3em] hover:bg-[#5C3D2E]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#5C3D2E]"
                >
                  {isSubmitting ? '處理中...' : (user ? '確認結帳' : '點此登入以結帳')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            onAdd={(item) => {
              setCart(c => [...c, { ...item, id: Math.random().toString(36).substr(2, 9) }]);
              setSelectedProduct(null);
              setIsCartOpen(true);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductModal({ product, onClose, onAdd }: { product: Product, onClose: () => void, onAdd: (item: Omit<CartItem, 'id'>) => void }) {
  const [size, setSize] = useState<SizeOptions>(product.price.L ? 'L' : 'M');
  const [sugar, setSugar] = useState<SugarOptions>('正常糖');
  const [ice, setIce] = useState<IceOptions>('正常冰');
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [quantity, setQuantity] = useState(1);

  const SUGARS: SugarOptions[] = ['正常糖', '少糖', '半糖', '微糖', '無糖'];
  const ICES: IceOptions[] = ['正常冰', '少冰', '微冰', '去冰', '熱'];

  const toggleTopping = (topping: Topping) => {
    setSelectedToppings(prev => 
      prev.some(t => t.id === topping.id) 
        ? prev.filter(t => t.id !== topping.id) 
        : [...prev, topping]
    );
  };

  const basePrice = product.price[size] ?? product.price.M ?? 0;
  const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const price = basePrice + toppingsPrice;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
        className="relative w-full max-w-lg bg-[#FFFDF9] font-sans shadow-2xl flex flex-col max-h-[90vh] border border-[#A73C3C]/30"
      >
        <div className="p-8 overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-[#5C3D2E]/50 hover:text-[#5C3D2E] transition-colors">
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center mb-10 mt-4">
            <h2 className="text-3xl font-serif text-[#5C3D2E] tracking-widest mb-2">{product.name}</h2>
            <p className="text-sm text-[#A73C3C] tracking-[0.2em] uppercase font-light">{product.engName}</p>
            <div className="w-12 h-px bg-[#A73C3C] mx-auto mt-6"></div>
          </div>

          <div className="space-y-8">
            {/* Size */}
            <div>
              <h3 className="text-xs tracking-[0.2em] font-bold text-[#5C3D2E] mb-3 uppercase">Size (容量)</h3>
              <div className="flex gap-3">
                {product.price.M && (
                  <button onClick={() => setSize('M')} className={cn("flex-1 py-4 border transition-all tracking-widest relative", size === 'M' ? "border-[#5C3D2E] bg-[#5C3D2E] text-[#FFFDF9]" : "border-[#A73C3C]/40 text-[#5C3D2E] hover:border-[#5C3D2E]")}>
                    中杯 (M)
                  </button>
                )}
                {product.price.L && (
                  <button onClick={() => setSize('L')} className={cn("flex-1 py-4 border transition-all tracking-widest relative", size === 'L' ? "border-[#5C3D2E] bg-[#5C3D2E] text-[#FFFDF9]" : "border-[#A73C3C]/40 text-[#5C3D2E] hover:border-[#5C3D2E]")}>
                    大杯 (L)
                  </button>
                )}
              </div>
            </div>

            {/* Sugar */}
            <div>
              <h3 className="text-xs tracking-[0.2em] font-bold text-[#5C3D2E] mb-3 uppercase">Sugar (甜度)</h3>
              <div className="grid grid-cols-5 gap-2">
                {SUGARS.map(s => (
                  <button key={s} onClick={() => setSugar(s)} className={cn("py-3 text-sm border transition-all", sugar === s ? "border-[#5C3D2E] bg-[#5C3D2E] text-[#FFFDF9]" : "border-[#A73C3C]/40 text-[#5C3D2E] hover:border-[#5C3D2E]")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Ice */}
            <div>
              <h3 className="text-xs tracking-[0.2em] font-bold text-[#5C3D2E] mb-3 uppercase">Ice (冰塊)</h3>
              <div className="grid grid-cols-5 gap-2">
                {ICES.map(i => (
                  <button key={i} onClick={() => setIce(i)} className={cn("py-3 text-sm border transition-all", ice === i ? "border-[#5C3D2E] bg-[#5C3D2E] text-[#FFFDF9]" : "border-[#A73C3C]/40 text-[#5C3D2E] hover:border-[#5C3D2E]")}>
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* Toppings */}
            <div>
              <h3 className="text-xs tracking-[0.2em] font-bold text-[#5C3D2E] mb-3 uppercase">Toppings (加料區)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {TOPPINGS.map(t => {
                  const isSelected = selectedToppings.some(st => st.id === t.id);
                  return (
                    <button 
                      key={t.id} 
                      onClick={() => toggleTopping(t)} 
                      className={cn(
                        "py-3 px-2 text-sm border transition-all flex justify-between items-center", 
                        isSelected ? "border-[#5C3D2E] bg-[#5C3D2E] text-[#FFFDF9]" : "border-[#A73C3C]/40 text-[#5C3D2E] hover:border-[#5C3D2E]"
                      )}
                    >
                      <span>{t.name}</span>
                      <span className="font-mono text-xs">+${t.price}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[#5C3D2E]/50 mt-2">* 溫、熱飲僅適用 $10 元加料物</p>
            </div>
            
            {/* Quantity */}
            <div>
              <h3 className="text-xs tracking-[0.2em] font-bold text-[#5C3D2E] mb-3 uppercase">Quantity (數量)</h3>
              <div className="flex items-center justify-center gap-6 p-2 border border-[#A73C3C]/40">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-[#5C3D2E] hover:bg-[#A73C3C]/10 transition-colors">
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-12 text-center font-bold text-2xl text-[#5C3D2E]">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-[#5C3D2E] hover:bg-[#A73C3C]/10 transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-[#5C3D2E] border-t-4 border-[#A73C3C]">
          <button 
            onClick={() => onAdd({ productId: product.id, name: product.name, price, size, sugar, ice, toppings: selectedToppings, quantity })}
            className="w-full bg-[#A73C3C] text-[#FFFDF9] py-4 font-bold tracking-[0.3em] hover:bg-[#8B2E2E] transition-all flex justify-between items-center px-8"
          >
            <span>加至購物車</span>
            <span className="font-mono text-xl">${price * quantity}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
