import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Clock, CheckCircle2, XCircle, Search, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  size: string;
  sugar: string;
  ice: string;
  toppings: any[];
}

interface Order {
  id: string;
  ownerId: string;
  customerName: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  createdAt: any;
  updatedAt: any;
}

const statusMap = {
  pending: { label: '待處理', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' },
  preparing: { label: '製作中', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
  ready: { label: '待取餐', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' },
  completed: { label: '已完成', color: 'bg-gray-500/20 text-gray-500 border-gray-500/50' },
  cancelled: { label: '已取消', color: 'bg-red-500/20 text-red-500 border-red-500/50' },
};

export default function Backend({ user }: { user: User | null }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
      alert("更新狀態失敗");
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh] font-sans">
        <div className="bg-[#FFFDF9] p-10 shadow-2xl border border-[#A73C3C]/30 max-w-sm w-full relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#A73C3C] -translate-x-[2px] -translate-y-[2px]"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#A73C3C] translate-x-[2px] -translate-y-[2px]"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#A73C3C] -translate-x-[2px] translate-y-[2px]"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#A73C3C] translate-x-[2px] translate-y-[2px]"></div>
          
          <Clock className="w-12 h-12 text-[#A73C3C] mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-[#5C3D2E] mb-2 tracking-widest">後台管理系統</h2>
          <p className="text-[#5C3D2E]/60 mb-8 tracking-widest text-sm">請先登入以檢視及管理訂單</p>
          <Link to="/" className="inline-flex items-center gap-2 text-[#A73C3C] hover:text-[#5C3D2E] transition-colors border-b border-transparent hover:border-[#FDFBF7] pb-1">
             <ArrowLeft className="w-4 h-4" /> 返回前台
          </Link>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => {
    if (filter === 'active') return !['completed', 'cancelled'].includes(o.status);
    if (filter === 'completed') return ['completed', 'cancelled'].includes(o.status);
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#5C3D2E] tracking-widest">訂單管理</h1>
          <p className="text-[#A73C3C] text-sm mt-2 tracking-[0.2em] uppercase font-light">Order Management</p>
        </div>
        
        <div className="flex border border-[#A73C3C]/40 p-1">
          {(['active', 'completed', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-2 text-sm tracking-widest transition-colors",
                filter === f 
                  ? "bg-[#A73C3C] text-[#5C3D2E] font-bold" 
                  : "text-[#A73C3C] hover:bg-[#A73C3C]/10"
              )}
            >
              {f === 'active' ? '處理中' : f === 'completed' ? '已完成' : '全部'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#A73C3C] tracking-widest">載入中...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-[#A73C3C]/30">
          <Search className="w-12 h-12 text-[#A73C3C]/40 mx-auto mb-4" />
          <p className="text-[#A73C3C]/60 tracking-widest">目前沒有符合條件的訂單</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <AnimatePresence>
            {filteredOrders.map(order => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={order.id} 
                className="bg-[#FFFDF9] border border-[#A73C3C]/30 flex flex-col relative"
              >
                <div className="p-5 border-b border-[#A73C3C]/20 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[#5C3D2E] font-bold text-lg select-all">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-sm text-[#5C3D2E] bg-[#A73C3C] px-2 py-0.5 font-bold tracking-widest">
                      {order.customerName}
                    </span>
                  </div>
                  <span className={cn("px-3 py-1 text-xs font-bold tracking-widest border", statusMap[order.status].color)}>
                    {statusMap[order.status].label}
                  </span>
                </div>
                
                <div className="p-6 flex-1">
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <span className="font-bold font-mono text-[#5C3D2E] w-6 text-center bg-[#A73C3C]/20 border border-[#A73C3C]/30 pt-0.5">
                            {item.quantity}
                          </span>
                          <div>
                            <div className="font-medium text-[#5C3D2E] tracking-widest">{item.name}</div>
                            <div className="text-xs text-[#A73C3C] mt-1 tracking-widest">
                              {item.size} / {item.sugar} / {item.ice}
                            </div>
                            {item.toppings && item.toppings.length > 0 && (
                              <div className="text-xs text-[#5C3D2E]/60 mt-1 tracking-widest">
                                + {item.toppings.map((t: any) => t.name).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="font-mono text-[#5C3D2E]">${item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-[#F4EFE6] flex items-center justify-between border-t border-[#A73C3C]/20">
                  <div className="text-[#A73C3C] tracking-widest font-bold">
                    總計 <span className="font-mono text-xl ml-2 text-[#5C3D2E]">${order.totalAmount}</span>
                  </div>
                  
                  <div className="flex gap-3">
                    {order.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(order.id, 'cancelled')} className="p-2 text-[#5C3D2E]/40 hover:text-red-400 hover:bg-white/5 transition-colors" title="取消訂單">
                          <XCircle className="w-6 h-6" />
                        </button>
                        <button onClick={() => updateStatus(order.id, 'preparing')} className="px-6 py-2 bg-transparent border border-[#A73C3C] text-[#A73C3C] text-sm font-bold tracking-widest hover:bg-[#A73C3C] hover:text-[#5C3D2E] transition-all">
                          開始製作
                        </button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <button onClick={() => updateStatus(order.id, 'ready')} className="px-6 py-2 bg-[#A73C3C] text-[#5C3D2E] text-sm font-bold tracking-widest hover:bg-white transition-all">
                        製作完成
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button onClick={() => updateStatus(order.id, 'completed')} className="px-6 py-2 bg-emerald-600 text-white border border-emerald-500 text-sm font-bold tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> 取餐完成
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
