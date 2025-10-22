"use client" 
// Chỉ thị của Next.js → đoạn code này chạy ở client side (frontend)

import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit"
// 🧩 useCurrentAccount: Lấy thông tin ví hiện đang được kết nối (địa chỉ user).
// 🧩 useSuiClient: Cung cấp client để gọi các API từ mạng Sui blockchain (ví dụ: lấy coin, gửi giao dịch, ...)

import { useQuery } from "@tanstack/react-query"
// 🧩 useQuery: Hook giúp quản lý dữ liệu bất đồng bộ (fetch / caching / refetch interval)


// 🪙 Lấy token type (coin type) từ biến môi trường.
// Đây KHÔNG phải TreasuryCap mà là Coin type, ví dụ: "0x2::sui::SUI" hoặc "0xabc123::mytoken::COIN"
const TOKEN_A_TYPE = process.env.NEXT_PUBLIC_TOKEN_A_TYPE!
const TOKEN_B_TYPE = process.env.NEXT_PUBLIC_TOKEN_B_TYPE!


// 🧠 Custom Hook: dùng để lấy số dư (balance) của hai token (A và B)
export function useBalance() {
  const account = useCurrentAccount() // 👉 Lấy thông tin tài khoản ví đang kết nối
  const client = useSuiClient()       // 👉 Lấy Sui client để tương tác với blockchain

  // ⚙️ React Query: quản lý việc fetch dữ liệu balance
  return useQuery({
    // Key duy nhất đại diện cho dữ liệu này trong cache.
    // Giúp React Query nhận biết khi nào cần refetch (khi address hoặc token thay đổi)
    queryKey: ["balance", account?.address, TOKEN_A_TYPE, TOKEN_B_TYPE],

    // Chỉ chạy query khi user đã kết nối ví
    enabled: !!account,

    // Hàm chính dùng để fetch dữ liệu
    queryFn: async () => {
      // Nếu chưa có account (chưa connect ví) → trả về 0 balance
      if (!account) return { tokenA: "0", tokenB: "0" }

      // 🧮 Hàm phụ để lấy tổng số dư của 1 loại token (coinType)
      const getSum = async (coinType: string) => {
        // Gọi API lấy toàn bộ các "coin object" thuộc loại coinType mà user sở hữu
        const response = await client.getCoins({ 
          owner: account.address, // địa chỉ ví
          coinType                // loại token
        })
        
        // Cộng dồn toàn bộ coin.balance lại (kiểu BigInt để tránh mất chính xác)
        return response.data.reduce(
          (sum, coin) => sum + BigInt(coin.balance), 
          BigInt(0)
        ).toString() // Trả về chuỗi
      }

      // ⚡️ Gọi song song 2 loại token (đỡ tốn thời gian)
      const [tokenA, tokenB] = await Promise.all([
        getSum(TOKEN_A_TYPE), 
        getSum(TOKEN_B_TYPE)
      ])
      
      // 🧾 Trả về kết quả + các helper để hiển thị dễ hơn
      return { 
        tokenA, // raw string balance (unit = smallest unit, ví dụ 1e-9 SUI)
        tokenB,

        // Convert sang dạng số dễ đọc (ví dụ chia cho 1e9 decimals)
        tokenABalance: (Number(tokenA) / 1e9).toFixed(2), 
        tokenBBalance: (Number(tokenB) / 1e9).toFixed(2),

        // Kiểm tra user có token hay không
        hasTokenA: BigInt(tokenA) > BigInt(0),
        hasTokenB: BigInt(tokenB) > BigInt(0)
      }
    },

    // Tự động refetch lại balance mỗi 10 giây
    refetchInterval: 10000,
  })
}
