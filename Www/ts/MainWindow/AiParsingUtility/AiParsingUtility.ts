import { getA1111 } from "./GetA1111";
import { getComfyui } from "./GetComfyui";
import { getInvokeai } from "./GetInvokeai";
import { getNormalJson } from "./GetNormalJson";
import { getNovelai } from "./GetNovelai";

/**
 * 提取 AI 繪圖的 Prompt
 */
export class AiParsingUtility {

	public static getA1111 = getA1111;

	public static getComfyui = getComfyui;

	public static getInvokeai = getInvokeai;

	public static getNovelai = getNovelai;

	/**
	 * 一般的 json 解析
	 */
	public static getNormalJson = getNormalJson;
}
