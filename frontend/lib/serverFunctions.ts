"use server";

export async function getFactoryAddress() {
  return process.env.LPNFT_FACTORY || "";
}
