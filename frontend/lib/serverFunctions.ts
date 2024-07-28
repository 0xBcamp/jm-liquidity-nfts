"use server";

export async function getFactoryAddress() {
  return process.env.LPNFT_FACTORY || "";
}

export async function getTokenA() {
  return process.env.TOKENA || "";
}

export async function getTokenB() {
  return process.env.TOKENB || "";
}

export async function getPairAddress() {
  return process.env.LPNFT_PAIR || "";
}
