/* Funções de formatação compartilhadas por checkout, pedido e meus pedidos. */
const Fmt = {
  money(v) {
    return Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  },
  esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  },
  date(s) {
    if (!s) return "";
    const d = new Date(String(s).replace(" ", "T"));
    return isNaN(d) ? "" : d.toLocaleString("pt-BR");
  },
  // status do banco -> rótulo e cor (aceita os apelidos antigos do esqueleto do back)
  ALIAS: { pending: "pending_payment", sent: "shipped", canceled: "cancelled" },
  STATUS: {
    pending_payment: ["Aguardando pagamento", "warning"],
    paid: ["Pago", "success"],
    shipped: ["Enviado", "info"],
    delivered: ["Entregue", "primary"],
    cancelled: ["Cancelado", "secondary"],
  },
  status(raw) {
    const key = this.ALIAS[raw] || raw;
    const [label, color] = this.STATUS[key] || [raw, "secondary"];
    return { key, label, color };
  },
  // aceita product_name/unit_price (banco) ou name/price
  item(i) {
    const price = Number(i.unit_price ?? i.price ?? 0);
    const quantity = Number(i.quantity ?? 0);
    return {
      name: i.product_name ?? i.name ?? "Produto",
      price,
      quantity,
      subtotal: Number(i.subtotal ?? price * quantity),
    };
  },
  address(a) {
    if (!a) return "";
    const line1 = [a.street, a.number].filter(Boolean).join(", ");
    const line2 = [a.complement, a.neighborhood].filter(Boolean).join(" - ");
    const line3 = [a.city, a.state].filter(Boolean).join(" - ");
    return [line1, line2, line3, a.zip_code ? "CEP " + a.zip_code : ""]
      .filter(Boolean).map(Fmt.esc).join("<br>");
  },
};