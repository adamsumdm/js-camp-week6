// ========================================
// 第六週作業：電商 API 資料串接練習
// 執行方式：node homework.js
// 環境需求：Node.js 18+（內建 fetch）
// ========================================

// 載入環境變數
require("dotenv").config({ path: ".env" });

// API 設定（從 .env 讀取）
const BASE_URL = "https://livejs-api.hexschool.io";
const API_MID_STR = "/api/livejs/v1/customer/";
const API_PATH = process.env.API_PATH;
const API_FULL_STR = BASE_URL+API_MID_STR+API_PATH;
// console.log(`show api_full_str:${API_FULL_STR}`);
const ADMIN_TOKEN = process.env.API_KEY;

// ========================================
// 任務一：基礎 fetch 練習
// ========================================

/**
 * 1. 取得產品列表
 * 使用 fetch 發送 GET 請求
 * @returns {Promise<Array>} - 回傳 products 陣列
 */
async function getProducts() {
	// 請實作此函式
	// 提示：
	// 1. 使用 fetch() 發送 GET 請求
	const response = await fetch(`${API_FULL_STR}/products`);
	// 2. 使用 response.json() 解析回應
	const data = await response.json();
	// 3. 回傳 data.products
	return data.products;
}

/**
 * 2. 取得購物車列表
 * @returns {Promise<Object>} - 回傳 { carts: [...], total: 數字, finalTotal: 數字 }
 */
async function getCart() {
	// 請實作此函式
	const response = await fetch(`${API_FULL_STR}/carts`);
	const data = await response.json();
	return {
				carts:data.carts, 
				total:data.total, 
				finalTotal:data.finalTotal
			};
}

/**
 * 3. 錯誤處理：當 API 回傳錯誤時，回傳錯誤訊息
 * @returns {Promise<Object>} - 回傳 { success: boolean, data?: [...], error?: string }
 */
async function getProductsSafe() {
	// 請實作此函式
	// 提示：
	// 1. 加上 try-catch 處理錯誤
	// 模擬 UI 狀態：開啟載入中動畫 (Loading Spinner)
	let isLoading = true;
	console.log("開始連線...");

	try {
		// 【 1. Try 區塊：執行可能會出錯的程式碼 】
		// 如果這裡發生「連線層級錯誤」(例如網路斷線)，會立刻跳到 catch
		const response = await fetch(`${API_FULL_STR}/products`);

		// 手動檢查 HTTP 狀態碼 (處理 404, 500 等非連線層級的錯誤)
		if (!response.ok) {
		// 這裡 throw 的錯誤，也會被下方的 catch 接住
		throw new Error(`伺服器回應錯誤！狀態碼：${response.status}`);
		}

		// 將回應解析為 JSON 格式
		const data = await response.json();
		console.log("資料取得成功：", data.products);
		return {
				success: response.ok,
				data: data.products
			}
	} catch (error) {
		// 【 2. Catch 區塊：專門處理錯誤 】
		// 這裡會接住「網路斷線 (TypeError)」、「CORS 錯誤」以及我們在上面手動 throw 的錯誤
		// 通常連線層級的錯誤，error.name 會是 TypeError，或者 error.message 會包含 "Failed to fetch"
		if (error instanceof TypeError) {
			console.error("連線失敗：請檢查您的網路狀態，或伺服器目前無回應。");
			return{
				success: false,
				data: error.message
			}
		} else {
			console.error("發生錯誤：", error.message);
			return{
				success: false,
				data: response.error
			}
		}
	} finally {
		// 【 3. Finally 區塊：無論成功或失敗，最後都一定會執行 】
		// 最常見的用途就是用來「關閉載入中動畫」或「解鎖被禁用的按鈕」
		isLoading = false;
		console.log("連線流程結束。");
	}
}

// ========================================
// 任務二：POST 請求 - 購物車操作
// ========================================

/**
 * 1. 加入商品到購物車
 * @param {string} productId - 產品 ID
 * @param {number} quantity - 數量
 * @returns {Promise<Object>} - 回傳更新後的購物車資料
 */
async function addToCart(productId, quantity) {
	// 請實作此函式
	// 提示：
	// 1. 發送 POST 請求
	const options = {
		method: "POST",
		headers: { 
			"Content-Type":"application/json"
		},
		body: JSON.stringify({
			data: {
				productId:productId,
				quantity: quantity
			}
		})
	}
	// fetch();
	const response = await fetch(`${API_FULL_STR}/carts`, options);
	const data = await response.json();
	// 2. body 格式：{ data: { productId: "xxx", quantity: 1 } }
	// 3. 記得設定 headers: { 'Content-Type': 'application/json' }
	// 4. body 要用 JSON.stringify() 轉換
	return data;
}

/**
 * 2. 編輯購物車商品數量
 * @param {string} cartId - 購物車項目 ID
 * @param {number} quantity - 新數量
 * @returns {Promise<Object>} - 回傳更新後的購物車資料
 */
async function updateCartItem(cartId, quantity) {
	// 請實作此函式
	// 提示：
	// 1. 發送 PATCH 請求
	// 2. body 格式：{ data: { id: "購物車ID", quantity: 數量 } }
		// 請實作此函式
	// 提示：發送 DELETE 請求到 /carts/{id}
	const updateData = {
		data:{
			id: cartId,
			quantity: quantity
		}
	};

	const options = {
		method: 'PATCH',
		headers: {
    		'Content-Type': 'application/json'
  		},
		body: JSON.stringify(updateData)
	};

	const response = await fetch(`${API_FULL_STR}/carts/`,options);
	const data = await response.json();
	// console.log("updateCartItem...return data",data);
	return data;
}

/**
 * 3. 刪除購物車特定商品
 * @param {string} cartId - 購物車項目 ID
 * @returns {Promise<Object>} - 回傳更新後的購物車資料
 */
async function removeCartItem(cartId) {
	// 請實作此函式
	// 提示：發送 DELETE 請求到 /carts/{id}
	const options = {
		method: "DELETE"
	};
	const response = await fetch(`${API_FULL_STR}/carts/${cartId}`,options);
	const data = await response.json();
	console.log("This is removeCartItem data.carts:",data);
	return data.carts;
}

/**
 * 4. 清空購物車
 * @returns {Promise<Object>} - 回傳清空後的購物車資料
 */
async function clearCart() {
	// 請實作此函式
	// 提示：發送 DELETE 請求到 /carts
	const response = await fetch(`${API_FULL_STR}/carts`,{
		method: "DELETE"
	});
	const data = await response.json();
	console.log("clearCart():",data);
	return data;
}

// ========================================
// HTTP 知識測驗 (額外練習)
// ========================================

/*
請回答以下問題（可以寫在這裡或另外繳交）：

1. HTTP 狀態碼的分類（1xx, 2xx, 3xx, 4xx, 5xx 各代表什麼）
   答：
   1xx: (100-199) 中間性質的回應，往往表示此請求尚未完成，伺服器端仍有後續處理作業中。
   2xx: (200-299) 成功回應，200 = OK; 201 = Created; 202 = Accepted。
   3xx: (300-399) 重新導向。
   4xx: (400-499) 用戶端錯誤，常見的有 400 = Bed Request，請求語法格式錯誤、無效的請求訊息框架；404 = 表示伺服器找不到所請求的資源。
   5xx: (500-599) 伺服端錯誤，常見的有 500 = Internal Server Error，該錯誤是一種通用的回應，表示伺服器找不到更適當的 5XX 錯誤來回應請求。

2. GET、POST、PATCH、PUT、DELETE 的差異
   答：
   > GET:單純向伺服器索取資料，參數通常放在 URL 的 Query String 中（如 ?id=1）。
   > POST:將新的資料傳送給伺服器，伺服器會依此建立新資源。
   > PATCH:傳送資料以局部修改指定的現有資源（只更新部分欄位）
   > PUT:傳送資料以完整替換指定的現有資源。
   > DELETE:告訴伺服器刪除指定的資源（目標通常寫在 URL 網址路徑中）。


3. 什麼是 RESTful API？
   答：RESTful API 的核心精神是，透過網址路徑表達「資源」，實際行為藉由 HTTP 的「方法」處理。


*/

// ========================================
// 匯出函式供測試使用
// ========================================
module.exports = {
	API_PATH,
	BASE_URL,
	ADMIN_TOKEN,
	getProducts,
	getCart,
	getProductsSafe,
	addToCart,
	updateCartItem,
	removeCartItem,
	clearCart,
};

// ========================================
// 直接執行測試
// ========================================
if (require.main === module) {
	async function runTests() {
		console.log("=== 第六週作業測試 ===\n");
		console.log("API_PATH:", API_PATH);
		console.log("");

		if (!API_PATH) {
			console.log("請先在 .env 檔案中設定 API_PATH！");
			return;
		}

		// 任務一測試
		console.log("--- 任務一：基礎 fetch ---");
		try {
			const products = await getProducts();
			console.log(
				"getProducts:",
				products ? `成功取得 ${products.length} 筆產品` : "回傳 undefined",
			);
		} catch (error) {
			console.log("getProducts 錯誤:", error.message);
		}

		try {
			const cart = await getCart();
			console.log(
				"getCart:",
				cart ? `購物車有 ${cart.carts?.length || 0} 筆商品` : "回傳 undefined",
			);
		} catch (error) {
			console.log("getCart 錯誤:", error.message);
		}

		try {
			const result = await getProductsSafe();
			console.log(
				"getProductsSafe:",
				result?.success ? "成功" : result?.error || "回傳 undefined",
			);
		} catch (error) {
			console.log("getProductsSafe 錯誤:", error.message);
		}

		console.log("\n=== 測試結束 ===");
		console.log("\n提示：執行 node test.js 進行完整驗證");
	}

	runTests();
}
