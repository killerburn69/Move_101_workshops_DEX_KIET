"use client"
// ✅ Chỉ thị của Next.js: đoạn code này chỉ chạy ở phía client (trình duyệt).
// Vì hook này tương tác với ví người dùng (sign transaction), nên bắt buộc phải là "client component".

import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit"
// 🧩 useSignAndExecuteTransaction: hook giúp ký và gửi giao dịch bằng ví người dùng.
// 🧩 useCurrentAccount: hook lấy thông tin ví hiện tại (địa chỉ, public key, ...).

import { Transaction } from "@mysten/sui/transactions"
// 🧩 Lớp Transaction hỗ trợ tạo giao dịch Move (add call, gas limit, arguments, ...).


// ⚙️ Lấy các biến môi trường cần thiết từ .env.local
// Đây là các ID/type mà frontend cần biết để tương tác đúng smart contract trên Sui.
const TOKEN_A_TYPE = process.env.NEXT_PUBLIC_TOKEN_A_TYPE!   // Coin type của Token A (vd: 0x123::coin::A)
const TOKEN_B_TYPE = process.env.NEXT_PUBLIC_TOKEN_B_TYPE!   // Coin type của Token B (vd: 0x456::coin::B)
const POOL_ID = process.env.NEXT_PUBLIC_POOL_ID!             // Object ID của pool chứa thanh khoản A/B
const PKG = process.env.NEXT_PUBLIC_PACKAGE_ID!              // Package ID của smart contract (Move module)


// 🧠 Tên module & hàm Move tương ứng với logic swap trong contract
const SWAP_MODULE = "swap"                      // Module chứa logic swap
const FN_A_TO_B = "swap_token_a_to_token_b"     // Hàm Move swap từ token A sang token B
const FN_B_TO_A = "swap_token_b_to_token_a"     // Hàm Move swap từ token B sang token A


// 💡 Custom hook: cung cấp 2 hàm swap A→B và B→A
export function useSwap() {
  // Lấy hàm giúp ký và gửi giao dịch (dùng ví user)
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  // Lấy thông tin account hiện tại (có thể dùng để hiển thị hoặc xác thực)
  const account = useCurrentAccount();


  // 🔁 Hàm thực hiện swap từ Token A → Token B
  const swapAtoB = async (coinObject: string) => {
    // Kiểm tra đủ các biến môi trường cần thiết
    if (!PKG || !POOL_ID || !TOKEN_A_TYPE || !TOKEN_B_TYPE) {
      throw new Error("Missing environment variables");
    }

    // ✨ Tạo transaction mới
    const tx = new Transaction();

    // Thiết lập gas limit (đơn vị MIST)
    tx.setGasBudget(50_000_000);

    // 🧱 Gọi hàm Move `swap_token_a_to_token_b` trong module `swap`
    tx.moveCall({
      target: `${PKG}::${SWAP_MODULE}::${FN_A_TO_B}`, // ví dụ: 0xabc::swap::swap_token_a_to_token_b
      arguments: [
        tx.object(POOL_ID),   // object pool chứa thanh khoản
        tx.object(coinObject) // object token A mà user muốn swap
      ]
    });

    // 📝 Ký và gửi transaction lên blockchain
    return signAndExecuteTransaction({ transaction: tx });
  };


  // 🔁 Hàm thực hiện swap từ Token B → Token A
  const swapBtoA = async (coinObject: string) => {
    if (!PKG || !POOL_ID || !TOKEN_A_TYPE || !TOKEN_B_TYPE) {
      throw new Error("Missing environment variables");
    }

    const tx = new Transaction();
    tx.setGasBudget(50_000_000);

    // Gọi hàm Move `swap_token_b_to_token_a`
    tx.moveCall({
      target: `${PKG}::${SWAP_MODULE}::${FN_B_TO_A}`,
      arguments: [
        tx.object(POOL_ID),
        tx.object(coinObject)
      ]
    });

    return signAndExecuteTransaction({ transaction: tx });
  };


  // 📦 Trả về các hàm tiện ích để component khác có thể gọi
  return { 
    swapAtoB,     // 👉 Swap từ token A sang token B
    swapBtoA,     // 👉 Swap từ token B sang token A
    isReady: !!(PKG && POOL_ID && TOKEN_A_TYPE && TOKEN_B_TYPE) // 👉 Check hook sẵn sàng (có đủ env chưa)
  };
}
