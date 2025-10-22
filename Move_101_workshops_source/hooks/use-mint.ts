"use client"
// ✅ Bắt buộc trong Next.js khi sử dụng hook (React state, browser API, v.v.)
// Vì hook này tương tác với ví người dùng → phải chạy ở client-side

import { useSignAndExecuteTransaction } from "@mysten/dapp-kit"
// 🧩 Hook dùng để ký (sign) và gửi (execute) giao dịch tới mạng Sui thông qua ví đã kết nối.

import { Transaction } from "@mysten/sui/transactions"
// 🧩 Class Transaction của SDK giúp tạo một giao dịch Move, thêm call, set gas, v.v.


// ⚙️ Lấy các biến môi trường cần thiết từ file .env.local
const TOKEN_A_TYPE = process.env.NEXT_PUBLIC_TOKEN_A_TYPE!      // Coin type của Token A
const TOKEN_B_TYPE = process.env.NEXT_PUBLIC_TOKEN_B_TYPE!      // Coin type của Token B
const TREASURY_CAP_A = process.env.NEXT_PUBLIC_TREASURY_CAP_A!  // Object ID của TreasuryCap<Token A>
const TREASURY_CAP_B = process.env.NEXT_PUBLIC_TREASURY_CAP_B!  // Object ID của TreasuryCap<Token B>
const PKG = process.env.NEXT_PUBLIC_PACKAGE_ID!                 // ID của package chứa module Move


// 🧠 Tên module và function trong package Move
const TOKEN_A = "token_a"                       // Module chứa logic mint token A
const TOKEN_B = "token_b"                       // Module chứa logic mint token B
const FN_MINT_HULK_TOKEN = "mint_token"         // Hàm Move để mint token A (Hulk)
const FN_MINT_GIRLFRIEND = "mint_token"         // Hàm Move để mint token B (Girlfriend)


export function useMint() {
    // 🧩 Hook từ @mysten/dapp-kit cung cấp hàm signAndExecuteTransaction
    // giúp ký giao dịch bằng ví và gửi lên blockchain.
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    

    // 💥 Hàm mint Hulk token (Token A)
    const mintHulkToken = async () => {
        // Kiểm tra đủ thông tin môi trường trước khi tạo giao dịch
        if (!TOKEN_A_TYPE || !TREASURY_CAP_A || !PKG) {
            throw new Error("Missing environment variables");
        }

        // ✨ Khởi tạo một giao dịch mới
        const tx = new Transaction();

        // Thiết lập gas limit cho giao dịch (đơn vị: MIST)
        tx.setGasBudget(30_000_000);

        // 🧱 Tạo một Move call (gọi hàm trong smart contract)
        tx.moveCall({
            target: `${PKG}::${TOKEN_A}::${FN_MINT_HULK_TOKEN}`, // Ví dụ: 0xabc::token_a::mint_token
            arguments: [
                tx.object(TREASURY_CAP_A), // Truyền vào TreasuryCap của token để mint
            ],
        });

        // 📝 Ký và gửi giao dịch lên blockchain
        return signAndExecuteTransaction({ transaction: tx });
    };


    // 💥 Hàm mint Girlfriend token (Token B)
    const mintGirlfriendToken = async () => {
        // Kiểm tra biến môi trường
        if (!TOKEN_B_TYPE || !TREASURY_CAP_B || !PKG) {
            throw new Error("Missing environment variables");
        }

        // ✨ Khởi tạo transaction mới
        const tx = new Transaction();
        tx.setGasBudget(30_000_000);

        // Gọi hàm mint token trong module token_b
        tx.moveCall({
            target: `${PKG}::${TOKEN_B}::${FN_MINT_GIRLFRIEND}`, // Ví dụ: 0xabc::token_b::mint_token
            arguments: [
                tx.object(TREASURY_CAP_B), // Truyền TreasuryCap của token B
            ],
        });
        
        // Ký và gửi giao dịch
        return signAndExecuteTransaction({ transaction: tx });
    };


    // 🧾 Trả về 2 hàm tiện ích để dùng trong component React
    // - mintHulkToken() → mint token A
    // - mintGirlfriendToken() → mint token B
    return { mintHulkToken, mintGirlfriendToken };
}
