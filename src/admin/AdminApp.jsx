
import React, { useState } from "react";
import {
  LayoutDashboard, Users, Store, Package, ShoppingCart, CreditCard, Truck,
  Scan, Megaphone, Headset, Bell, ChartNoAxesCombined, Settings, Search,
  Plus, Pencil, Trash2, Download, Menu, X, Moon, Sun, RotateCcw, Globe,
  PanelLeftClose, PanelLeftOpen, Clock3, Wallet, TrendingUp, Filter
} from "lucide-react";
import {
  getAll, saveRecord, deleteRecord, getSummary, resetDemoData
} from "./api.js";
import "./admin.css";

const TRANSLATIONS = {
  en: {
    "Overview":"Overview","Users":"Users","Sellers":"Sellers","Products":"Products",
    "Orders":"Orders","Payments":"Payments","Delivery":"Delivery",
    "Virtual Try-On":"Virtual Try-On","Advertisements":"Advertisements",
    "Analytics":"Analytics","Support":"Support","Notifications":"Notifications",
    "Settings":"Settings","WORKSPACE":"WORKSPACE","ADMINISTRATION":"ADMINISTRATION",
    "Good day, Administrator 👋":"Good day, Administrator 👋",
    "Here is what's happening with your online shopping platform.":"Here is what's happening with your online shopping platform.",
    "Local workspace":"Local workspace","Total users":"Total users","Revenue":"Revenue",
    "Pending sellers":"Pending sellers","Current records":"Current records",
    "Recent orders":"Recent orders","Latest order records in this browser":"Latest order records in this browser",
    "View all":"View all","Quick actions":"Quick actions","Manage your platform":"Manage your platform",
    "Manage":"Manage","No records found":"No records found",
    "Create a record to get started.":"Create a record to get started.",
    "Actions":"Actions","MANAGEMENT":"MANAGEMENT",
    "Create, view, update and delete":"Create, view, update and delete",
    "Add":"Add","Search":"Search","Export":"Export","All":"All","records":"records",
    "Changes are saved in this browser":"Changes are saved in this browser",
    "UPDATE RECORD":"UPDATE RECORD","NEW RECORD":"NEW RECORD","Edit":"Edit",
    "Cancel":"Cancel","Save changes":"Save changes","Create record":"Create record",
    "is required.":"is required.","Choose":"Choose","Enter":"Enter",
    "Local data":"Local data","INSIGHTS":"INSIGHTS",
    "Summary of the records currently stored in this browser.":"Summary of the records currently stored in this browser.",
    "Platform overview":"Platform overview","Record counts by module":"Record counts by module",
    "PREFERENCES":"PREFERENCES","Manage this local frontend workspace.":"Manage this local frontend workspace.",
    "Local data storage":"Local data storage",
    "Records are saved in this browser using localStorage. They are not sent to a server or shared with other users.":"Records are saved in this browser using localStorage. They are not sent to a server or shared with other users.",
    "Reset sample data":"Reset sample data","Backend integration":"Backend integration",
    "This version intentionally runs without a backend. Your team can connect the API later by replacing the local data layer.":"This version intentionally runs without a backend. Your team can connect the API later by replacing the local data layer.",
    "Not connected":"Not connected",
    "Reset all local dashboard records to the original sample data?":"Reset all local dashboard records to the original sample data?",
    "Delete record":"Delete record","This cannot be undone.":"This cannot be undone.",
    "Frontend-only workspace":"Frontend-only workspace","Language":"Language",
    "English":"English","Amharic":"Amharic","Afaan Oromoo":"Afaan Oromoo",
    "Language preference":"Language preference",
    "Choose the language used across the dashboard.":"Choose the language used across the dashboard.",
    "Toggle sidebar":"Toggle sidebar","Administrator":"Administrator",
    "Close menu":"Close menu","Toggle theme":"Toggle theme",
    "Full name":"Full name","Email":"Email","Role":"Role","Status":"Status","City":"City",
    "Business name":"Business name","Owner":"Owner","Product name":"Product name",
    "Category":"Category","Price (ETB)":"Price (ETB)","Stock":"Stock",
    "Buyer":"Buyer","Product":"Product","Amount (ETB)":"Amount (ETB)",
    "Payment status":"Payment status","Delivery status":"Delivery status","Date":"Date",
    "Order ID":"Order ID","Customer":"Customer","Method":"Method","Carrier":"Carrier",
    "Model status":"Model status","Updated date":"Updated date",
    "Campaign title":"Campaign title","Seller":"Seller","Budget (ETB)":"Budget (ETB)",
    "Subject":"Subject","Priority":"Priority","Title":"Title","Type":"Type",
    "Virtual Try-On Models":"Virtual Try-On Models","Support Tickets":"Support Tickets",
    "Active":"Active","Approved":"Approved","Paid":"Paid","Delivered":"Delivered",
    "Ready":"Ready","Resolved":"Resolved","Read":"Read","Pending":"Pending",
    "Processing":"Processing","In transit":"In transit","In progress":"In progress",
    "Unread":"Unread","Suspended":"Suspended","Rejected":"Rejected","Failed":"Failed",
    "Refunded":"Refunded","Cancelled":"Cancelled","Picked up":"Picked up",
    "Open":"Open","Low":"Low","Normal":"Normal","High":"High","Urgent":"Urgent"
  },

  am: {
    "Overview":"አጠቃላይ እይታ","Users":"ተጠቃሚዎች","Sellers":"ሻጮች",
    "Products":"ምርቶች","Orders":"ትዕዛዞች","Payments":"ክፍያዎች",
    "Delivery":"ማድረስ","Virtual Try-On":"ምናባዊ መልበስ",
    "Advertisements":"ማስታወቂያዎች","Analytics":"ትንታኔ",
    "Support":"ድጋፍ","Notifications":"ማሳወቂያዎች","Settings":"ቅንብሮች",
    "WORKSPACE":"የሥራ ቦታ","ADMINISTRATION":"አስተዳደር",
    "Good day, Administrator 👋":"ሰላም፣ አስተዳዳሪ 👋",
    "Here is what's happening with your online shopping platform.":"በመስመር ላይ የግዢ መድረክዎ ላይ ያለው ሁኔታ ይህ ነው።",
    "Local workspace":"የአካባቢ የሥራ ቦታ",
    "Total users":"ጠቅላላ ተጠቃሚዎች","Revenue":"ገቢ",
    "Pending sellers":"በመጠባበቅ ላይ ያሉ ሻጮች",
    "Current records":"ያሉ መዝገቦች","Recent orders":"የቅርብ ጊዜ ትዕዛዞች",
    "Latest order records in this browser":"በዚህ አሳሽ ውስጥ ያሉ የቅርብ ጊዜ ትዕዛዞች",
    "View all":"ሁሉንም ይመልከቱ","Quick actions":"ፈጣን እርምጃዎች",
    "Manage your platform":"መድረክዎን ያስተዳድሩ","Manage":"አስተዳድር",
    "No records found":"ምንም መዝገብ አልተገኘም",
    "Create a record to get started.":"ለመጀመር አዲስ መዝገብ ይፍጠሩ።",
    "Actions":"እርምጃዎች","MANAGEMENT":"አስተዳደር",
    "Create, view, update and delete":"መዝገቦችን ይፍጠሩ፣ ይመልከቱ፣ ያዘምኑ እና ይሰርዙ",
    "Add":"ጨምር","Search":"ፈልግ","Export":"ወደ ውጭ ላክ",
    "All":"ሁሉም","records":"መዝገቦች",
    "Changes are saved in this browser":"ለውጦች በዚህ አሳሽ ውስጥ ይቀመጣሉ",
    "UPDATE RECORD":"መዝገብ አዘምን","NEW RECORD":"አዲስ መዝገብ",
    "Edit":"አርትዕ","Cancel":"ሰርዝ","Save changes":"ለውጦችን አስቀምጥ",
    "Create record":"መዝገብ ፍጠር","is required.":"ያስፈልጋል።",
    "Choose":"ይምረጡ","Enter":"ያስገቡ","Local data":"የአካባቢ ውሂብ",
    "INSIGHTS":"ግንዛቤዎች",
    "Summary of the records currently stored in this browser.":"በዚህ አሳሽ የተቀመጡ መዝገቦች ማጠቃለያ።",
    "Platform overview":"የመድረኩ አጠቃላይ እይታ",
    "Record counts by module":"በክፍል የመዝገብ ብዛት",
    "PREFERENCES":"ምርጫዎች",
    "Manage this local frontend workspace.":"ይህን የአካባቢ የፊት-ገጽ የሥራ ቦታ ያስተዳድሩ።",
    "Local data storage":"የአካባቢ ውሂብ ማከማቻ",
    "Records are saved in this browser using localStorage. They are not sent to a server or shared with other users.":"መዝገቦች በዚህ አሳሽ localStorage ውስጥ ይቀመጣሉ። ወደ ሰርቨር አይላኩም እና ከሌሎች ተጠቃሚዎች ጋር አይጋሩም።",
    "Reset sample data":"የናሙና ውሂብን ዳግም አስጀምር",
    "Backend integration":"የBackend ግንኙነት",
    "This version intentionally runs without a backend. Your team can connect the API later by replacing the local data layer.":"ይህ ስሪት backend ሳይኖረው እንዲሰራ ተዘጋጅቷል። ቡድንዎ በኋላ የአካባቢ ውሂብ ክፍሉን በመተካት API ማገናኘት ይችላል።",
    "Not connected":"አልተገናኘም",
    "Reset all local dashboard records to the original sample data?":"ሁሉንም የአካባቢ ዳሽቦርድ መዝገቦች ወደ መጀመሪያው የናሙና ውሂብ ዳግም ያስጀምሩ?",
    "Delete record":"መዝገብ ሰርዝ","This cannot be undone.":"ይህን መመለስ አይቻልም።",
    "Frontend-only workspace":"የFrontend ብቻ የሥራ ቦታ",
    "Language":"ቋንቋ","English":"እንግሊዝኛ","Amharic":"አማርኛ",
    "Afaan Oromoo":"አፋን ኦሮሞ","Language preference":"የቋንቋ ምርጫ",
    "Choose the language used across the dashboard.":"በዳሽቦርዱ ላይ የሚጠቀሙበትን ቋንቋ ይምረጡ።",
    "Toggle sidebar":"የጎን ምናሌን ቀይር","Administrator":"አስተዳዳሪ",
    "Close menu":"ምናሌውን ዝጋ","Toggle theme":"ገጽታ ቀይር",
    "Full name":"ሙሉ ስም","Email":"ኢሜይል","Role":"ሚና","Status":"ሁኔታ",
    "City":"ከተማ","Business name":"የንግድ ስም","Owner":"ባለቤት",
    "Product name":"የምርት ስም","Category":"ምድብ","Price (ETB)":"ዋጋ (ETB)",
    "Stock":"ክምችት","Buyer":"ገዢ","Product":"ምርት",
    "Amount (ETB)":"መጠን (ETB)","Payment status":"የክፍያ ሁኔታ",
    "Delivery status":"የማድረስ ሁኔታ","Date":"ቀን","Order ID":"የትዕዛዝ መለያ",
    "Customer":"ደንበኛ","Method":"ዘዴ","Carrier":"አጓጓዥ",
    "Model status":"የሞዴል ሁኔታ","Updated date":"የተዘመነበት ቀን",
    "Campaign title":"የዘመቻ ርዕስ","Seller":"ሻጭ","Budget (ETB)":"በጀት (ETB)",
    "Subject":"ርዕስ","Priority":"ቅድሚያ","Title":"ርዕስ","Type":"ዓይነት",
    "Virtual Try-On Models":"የምናባዊ መልበስ ሞዴሎች",
    "Support Tickets":"የድጋፍ ጥያቄዎች",
    "Active":"ንቁ","Approved":"ጸድቋል","Paid":"ተከፍሏል",
    "Delivered":"ደርሷል","Ready":"ዝግጁ","Resolved":"ተፈትቷል",
    "Read":"ተነቧል","Pending":"በመጠባበቅ ላይ","Processing":"በሂደት ላይ",
    "In transit":"በመጓጓዣ ላይ","In progress":"በሂደት ላይ",
    "Unread":"ያልተነበበ","Suspended":"ታግዷል","Rejected":"ውድቅ ተደርጓል",
    "Failed":"አልተሳካም","Refunded":"ተመላሽ ተደርጓል",
    "Cancelled":"ተሰርዟል","Picked up":"ተሰብስቧል","Open":"ክፍት",
    "Low":"ዝቅተኛ","Normal":"መደበኛ","High":"ከፍተኛ","Urgent":"አስቸኳይ"
  },

  om: {
    "Overview":"Cuunfaa","Users":"Fayyadamtoota","Sellers":"Gurgurtoota",
    "Products":"Oomishaalee","Orders":"Ajajawwan","Payments":"Kaffaltiiwwan",
    "Delivery":"Geejjiba","Virtual Try-On":"Uffata Yaalii Dijitaalaa",
    "Advertisements":"Beeksisawwan","Analytics":"Xiinxala","Support":"Deeggarsa",
    "Notifications":"Beeksisa","Settings":"Qindaa'ina","WORKSPACE":"BAKKA HOJII",
    "ADMINISTRATION":"BULCHIINSA","Good day, Administrator 👋":"Akkam, Bulchaa 👋",
    "Here is what's happening with your online shopping platform.":"Haalli waltajjii bittaa interneetii keessanii kunoo.",
    "Local workspace":"Bakka hojii naannoo","Total users":"Fayyadamtoota waliigalaa",
    "Revenue":"Galii","Pending sellers":"Gurgurtoota eeggachaa jiran",
    "Current records":"Galmeewwan amma jiran","Recent orders":"Ajajawwan dhiheenya",
    "Latest order records in this browser":"Galmeewwan ajajaa dhiheenyaa biraawzara kana keessa jiran",
    "View all":"Hunda ilaali","Quick actions":"Tarkaanfiiwwan saffisaa",
    "Manage your platform":"Waltajjii kee bulchi","Manage":"Bulchi",
    "No records found":"Galmeen hin argamne",
    "Create a record to get started.":"Jalqabuuf galmee haaraa uumi.",
    "Actions":"Tarkaanfiiwwan","MANAGEMENT":"BULCHIINSA",
    "Create, view, update and delete":"Galmeewwan uumi, ilaali, haaromsi fi haqi",
    "Add":"Dabaluu","Search":"Barbaadi","Export":"Ergi","All":"Hunda",
    "records":"galmeewwan","Changes are saved in this browser":"Jijjiiramni biraawzara kana keessatti kuufama",
    "UPDATE RECORD":"GALMEE HAAROMSI","NEW RECORD":"GALMEE HAARAA",
    "Edit":"Gulaali","Cancel":"Dhiisi","Save changes":"Jijjiirama olkaa'i",
    "Create record":"Galmee uumi","is required.":"barbaachisa.",
    "Choose":"Filadhu","Enter":"Galchi","Local data":"Daataa naannoo",
    "INSIGHTS":"XIINXALA",
    "Summary of the records currently stored in this browser.":"Cuunfaa galmeewwan biraawzara kana keessatti kuufamanii.",
    "Platform overview":"Ilaalcha waliigalaa waltajjii",
    "Record counts by module":"Baay'ina galmee kutaa kutaan",
    "PREFERENCES":"FILANNOO",
    "Manage this local frontend workspace.":"Bakka hojii frontend naannoo kana bulchi.",
    "Local data storage":"Kuusaa daataa naannoo",
    "Records are saved in this browser using localStorage. They are not sent to a server or shared with other users.":"Galmeewwan localStorage fayyadamuun biraawzara kana keessatti kuufamu. Gara server hin ergaman, fayyadamtoota biroos waliin hin qoodaman.",
    "Reset sample data":"Daataa fakkeenyaa deebisi",
    "Backend integration":"Walitti hidhiinsa Backend",
    "This version intentionally runs without a backend. Your team can connect the API later by replacing the local data layer.":"Vershiniin kun backend malee akka hojjetu qophaa'e. Gareen keessan boodarra daataa naannoo bakka buusuun API wal qunnamsiisuu danda'a.",
    "Not connected":"Hin wal qunnamne",
    "Reset all local dashboard records to the original sample data?":"Galmeewwan dashboard naannoo hunda gara daataa fakkeenyaa jalqabaatti deebistaa?",
    "Delete record":"Galmee haqi","This cannot be undone.":"Kun deebifamuu hin danda'u.",
    "Frontend-only workspace":"Bakka hojii frontend qofa",
    "Language":"Afaan","English":"Ingiliffa","Amharic":"Amaaraa",
    "Afaan Oromoo":"Afaan Oromoo","Language preference":"Filannoo afaanii",
    "Choose the language used across the dashboard.":"Afaan dashboard guutuu irratti fayyadamtu filadhu.",
    "Toggle sidebar":"Moggaa jijjiiri","Administrator":"Bulchaa",
    "Close menu":"Moggaa cufi","Toggle theme":"Bifa jijjiiri",
    "Full name":"Maqaa guutuu","Email":"Imeelii","Role":"Gahee","Status":"Haala",
    "City":"Magaalaa","Business name":"Maqaa daldalaa","Owner":"Abbaa qabeenyaa",
    "Product name":"Maqaa oomishaa","Category":"Ramaddii","Price (ETB)":"Gatii (ETB)",
    "Stock":"Kuusaa","Buyer":"Bitataa","Product":"Oomisha",
    "Amount (ETB)":"Hamma (ETB)","Payment status":"Haala kaffaltii",
    "Delivery status":"Haala geejjibaa","Date":"Guyyaa","Order ID":"ID ajajaa",
    "Customer":"Maamila","Method":"Mala","Carrier":"Geejjibaa",
    "Model status":"Haala moodeelaa","Updated date":"Guyyaa haaromfame",
    "Campaign title":"Mata-duree duulaa","Seller":"Gurguraa",
    "Budget (ETB)":"Baajata (ETB)","Subject":"Dhimma","Priority":"Dursa",
    "Title":"Mata-duree","Type":"Gosa",
    "Virtual Try-On Models":"Moodeelota uffata yaalii dijitaalaa",
    "Support Tickets":"Gaaffilee deeggarsaa","Active":"Sochoo",
    "Approved":"Mirkanaa'e","Paid":"Kaffalame","Delivered":"Geessame",
    "Ready":"Qophaa'e","Resolved":"Furame","Read":"Dubbifame",
    "Pending":"Eeggataa","Processing":"Hojjetamaa jira",
    "In transit":"Karaa irra","In progress":"Adeemsa irra",
    "Unread":"Hin dubbifamne","Suspended":"Uggurame",
    "Rejected":"Fudhatama dhabe","Failed":"Hin milkoofne",
    "Refunded":"Deebi'e","Cancelled":"Haqame","Picked up":"Fudhatame",
    "Open":"Banaa","Low":"Xiqqaa","Normal":"Idilee","High":"Olaanaa",
    "Urgent":"Ariifachiisaa"
  }
};

const translate = (lang, value) =>
  TRANSLATIONS[lang]?.[value] || TRANSLATIONS.en[value] || value;

const NAV = [
  ["overview", "Overview", LayoutDashboard],
  ["users", "Users", Users],
  ["sellers", "Sellers", Store],
  ["products", "Products", Package],
  ["orders", "Orders", ShoppingCart],
  ["payments", "Payments", CreditCard],
  ["delivery", "Delivery", Truck],
  ["tryon", "Virtual Try-On", Scan],
  ["ads", "Advertisements", Megaphone],
  ["analytics", "Analytics", ChartNoAxesCombined],
  ["support", "Support", Headset],
  ["notifications", "Notifications", Bell],
  ["settings", "Settings", Settings]
];

const CONFIG = {
  users: {
    title: "Users",
    fields: [
      ["name","Full name","text"],
      ["email","Email","email"],
      ["role","Role","select","Buyer|Seller|Admin"],
      ["status","Status","select","Active|Suspended"],
      ["city","City","text"]
    ]
  },
  sellers: {
    title: "Sellers",
    fields: [
      ["business","Business name","text"],
      ["owner","Owner","text"],
      ["email","Email","email"],
      ["city","City","text"],
      ["status","Status","select","Pending|Approved|Rejected"]
    ]
  },
  products: {
    title: "Products",
    fields: [
      ["name","Product name","text"],
      ["category","Category","text"],
      ["price","Price (ETB)","number"],
      ["stock","Stock","number"],
      ["status","Status","select","Pending|Approved|Rejected"]
    ]
  },
  orders: {
    title: "Orders",
    fields: [
      ["buyer","Buyer","text"],
      ["product","Product","text"],
      ["amount","Amount (ETB)","number"],
      ["paymentStatus","Payment status","select","Pending|Paid|Failed|Refunded"],
      ["deliveryStatus","Delivery status","select","Processing|In transit|Delivered|Cancelled"],
      ["date","Date","date"]
    ]
  },
  payments: {
    title: "Payments",
    fields: [
      ["orderId","Order ID","text"],
      ["customer","Customer","text"],
      ["amount","Amount (ETB)","number"],
      ["method","Method","select","Telebirr|CBE Birr|Bank Transfer|Cash"],
      ["status","Status","select","Pending|Paid|Failed|Refunded"],
      ["date","Date","date"]
    ]
  },
  delivery: {
    title: "Delivery",
    fields: [
      ["orderId","Order ID","text"],
      ["customer","Customer","text"],
      ["carrier","Carrier","text"],
      ["city","City","text"],
      ["status","Status","select","Processing|Picked up|In transit|Delivered|Cancelled"]
    ]
  },
  tryon: {
    title: "Virtual Try-On Models",
    fields: [
      ["product","Product","text"],
      ["category","Category","text"],
      ["modelStatus","Model status","select","Pending|Processing|Ready|Failed"],
      ["updated","Updated date","date"]
    ]
  },
  ads: {
    title: "Advertisements",
    fields: [
      ["title","Campaign title","text"],
      ["seller","Seller","text"],
      ["budget","Budget (ETB)","number"],
      ["status","Status","select","Pending|Active|Paused|Rejected"]
    ]
  },
  support: {
    title: "Support Tickets",
    fields: [
      ["subject","Subject","text"],
      ["customer","Customer","text"],
      ["priority","Priority","select","Low|Normal|High|Urgent"],
      ["status","Status","select","Open|In progress|Resolved"]
    ]
  },
  notifications: {
    title: "Notifications",
    fields: [
      ["title","Title","text"],
      ["type","Type","text"],
      ["status","Status","select","Unread|Read"],
      ["date","Date","date"]
    ]
  }
};

const money = (value) =>
  new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0
  }).format(Number(value || 0));

const today = () => new Date().toISOString().slice(0, 10);

function Modal({ module, initial, onClose, onSave, t }) {
  const config = CONFIG[module];

  const [form, setForm] = useState(() =>
    Object.fromEntries(
      config.fields.map(([key]) => [
        key,
        initial?.[key] ?? (key === "date" || key === "updated" ? today() : "")
      ])
    )
  );

  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();

    const missing = config.fields.find(([key, label, type]) =>
      type !== "number" && !String(form[key] ?? "").trim()
    );

    if (missing) {
      setError(`${t(missing[1])} ${t("is required.")}`);
      return;
    }

    const clean = { ...form };

    config.fields.forEach(([key, , type]) => {
      if (type === "number") clean[key] = Number(clean[key] || 0);
    });

    onSave({ ...(initial || {}), ...clean });
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) =>
        event.target === event.currentTarget && onClose()
      }
    >
      <form className="modal-card" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <span className="eyebrow">
              {t(initial ? "UPDATE RECORD" : "NEW RECORD")}
            </span>
            <h2>
              {t(initial ? "Edit" : "Add")} {t(config.title).replace(/s$/, "")}
            </h2>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        <div className="form-grid">
          {config.fields.map(([key, label, type, options]) => (
            <label className="field" key={key}>
              <span>{t(label)}</span>

              {type === "select" ? (
                <select
                  value={form[key]}
                  onChange={(event) =>
                    setForm({ ...form, [key]: event.target.value })
                  }
                >
                  <option value="">
                    {t("Choose")} {t(label).toLowerCase()}
                  </option>
                  {options.split("|").map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  min={type === "number" ? "0" : undefined}
                  value={form[key]}
                  onChange={(event) =>
                    setForm({ ...form, [key]: event.target.value })
                  }
                  placeholder={`${t("Enter")} ${t(label).toLowerCase()}`}
                />
              )}
            </label>
          ))}
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-light"
            onClick={onClose}
          >
            {t("Cancel")}
          </button>
          <button className="btn btn-primary" type="submit">
            {t(initial ? "Save changes" : "Create record")}
          </button>
        </div>
      </form>
    </div>
  );
}

function Status({ value, t }) {
  const cls =
    /active|approved|paid|delivered|ready|resolved|read/i.test(value || "")
      ? "good"
      : /pending|processing|transit|progress|unread/i.test(value || "")
      ? "warning"
      : "muted";

  return (
    <span className={`status ${cls}`}>
      <i />
      {t(value || "—")}
    </span>
  );
}

function Overview({ onNavigate, t }) {
  const summary = getSummary();
  const orders = getAll("orders").slice(-5).reverse();

  const stats = [
    ["Total users", summary.users, Users, "blue"],
    ["Sellers", summary.sellers, Store, "purple"],
    ["Products", summary.products, Package, "orange"],
    ["Orders", summary.orders, ShoppingCart, "green"],
    ["Revenue", money(summary.revenue), Wallet, "blue"],
    ["Pending sellers", summary.pending, Clock3, "orange"]
  ];

  return (
    <div className="page-stack">
      <div className="welcome">
        <div>
          <span className="eyebrow">{t("ADMINISTRATION")}</span>
          <h2>{t("Good day, Administrator 👋")}</h2>
          <p>{t("Here is what's happening with your online shopping platform.")}</p>
        </div>
        <span className="live-pill">
          <i /> {t("Local workspace")}
        </span>
      </div>

      <div className="stats-grid">
        {stats.map(([label, value, Icon, color]) => (
          <div className="stat-card" key={label}>
            <div className={`stat-icon ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <span>{t(label)}</span>
              <strong>{value}</strong>
              <small>
                <TrendingUp size={13} /> {t("Current records")}
              </small>
            </div>
          </div>
        ))}
      </div>

      <div className="content-grid">
        <section className="panel panel-wide">
          <div className="panel-heading">
            <div>
              <h3>{t("Recent orders")}</h3>
              <p>{t("Latest order records in this browser")}</p>
            </div>
            <button className="text-btn" onClick={() => onNavigate("orders")}>
              {t("View all")} <span>→</span>
            </button>
          </div>
          <DataTable module="orders" rows={orders} compact t={t} />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>{t("Quick actions")}</h3>
              <p>{t("Manage your platform")}</p>
            </div>
          </div>
          <div className="quick-actions">
            {["users", "products", "orders", "sellers"].map((key) => {
              const item = NAV.find(([id]) => id === key);
              const Icon = item[2];

              return (
                <button key={key} onClick={() => onNavigate(key)}>
                  <span><Icon size={18} /></span>
                  <b>{t("Manage")} {t(item[1])}</b>
                  <span className="arrow">↗</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function DataTable({ module, rows, onEdit, onDelete, compact = false, t }) {
  if (!rows.length) {
    return (
      <div className="empty-state">
        <Package size={28} />
        <b>{t("No records found")}</b>
        <span>{t("Create a record to get started.")}</span>
      </div>
    );
  }

  const keys = Object.keys(rows[0]).filter((key) => key !== "id");

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            {keys.map((key) => (
              <th key={key}>
                {t(
                  key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (s) => s.toUpperCase())
                    .replace(/ ([A-Z])/g, (_, c) => " " + c.toLowerCase())
                )}
              </th>
            ))}
            {!compact && <th className="action-col">{t("Actions")}</th>}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="id-cell">#{row.id}</td>

              {keys.map((key) => (
                <td key={key}>
                  {/status/i.test(key) ? (
                    <Status value={row[key]} t={t} />
                  ) : /amount|price|budget/i.test(key) ? (
                    money(row[key])
                  ) : (
                    String(row[key] ?? "—")
                  )}
                </td>
              ))}

              {!compact && (
                <td>
                  <div className="row-actions">
                    <button title={t("Edit")} onClick={() => onEdit(row)}>
                      <Pencil size={15} />
                    </button>
                    <button
                      title={t("Delete record")}
                      className="danger-action"
                      onClick={() => onDelete(row)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ModulePage({ module, refreshKey, onRefresh, t }) {
  const config = CONFIG[module];
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [modal, setModal] = useState(null);

  const rows = getAll(module);

  const statuses = [
    ...new Set(
      rows
        .map((row) =>
          Object.entries(row).find(([key]) => /status/i.test(key))?.[1]
        )
        .filter(Boolean)
    )
  ];

  const filtered = rows.filter(
    (row) =>
      JSON.stringify(row).toLowerCase().includes(query.toLowerCase()) &&
      (status === "All" ||
        Object.entries(row).some(
          ([key, value]) => /status/i.test(key) && value === status
        ))
  );

  function save(record) {
    saveRecord(module, record);
    setModal(null);
    onRefresh();
  }

  function remove(row) {
    if (
      window.confirm(
        `${t("Delete record")} #${row.id}? ${t("This cannot be undone.")}`
      )
    ) {
      deleteRecord(module, row.id);
      onRefresh();
    }
  }

  function exportCsv() {
    const cols = rows[0] ? Object.keys(rows[0]) : ["id"];
    const csv = [
      cols.join(","),
      ...filtered.map((row) =>
        cols
          .map(
            (key) =>
              `"${String(row[key] ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
    ].join("\n");

    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv" })
    );
    link.download = `${module}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="page-stack" key={refreshKey}>
      <div className="page-title">
        <div>
          <span className="eyebrow">{t("MANAGEMENT")}</span>
          <h2>{t(config.title)}</h2>
          <p>
            {t("Create, view, update and delete")}{" "}
            {t(config.title).toLowerCase()} {t("records")}.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setModal({})}>
          <Plus size={17} /> {t("Add")} {t(config.title.replace(/s$/, ""))}
        </button>
      </div>

      <section className="panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`${t("Search")} ${t(config.title).toLowerCase()}...`}
            />
          </div>

          <div className="toolbar-right">
            <div className="filter-box">
              <Filter size={15} />
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="All">{t("All")}</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{t(s)}</option>
                ))}
              </select>
            </div>

            <button className="btn btn-light" onClick={exportCsv}>
              <Download size={16} /> {t("Export")}
            </button>
          </div>
        </div>

        <div className="table-summary">
          <span><b>{filtered.length}</b> {t("records")}</span>
          <span>{t("Changes are saved in this browser")}</span>
        </div>

        <DataTable
          module={module}
          rows={filtered}
          onEdit={(row) => setModal(row)}
          onDelete={remove}
          t={t}
        />
      </section>

      {modal && (
        <Modal
          module={module}
          initial={modal.id ? modal : null}
          onClose={() => setModal(null)}
          onSave={save}
          t={t}
        />
      )}
    </div>
  );
}

export default function AdminApp() {
  const [active, setActive] = useState("overview");

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("shopadmin-sidebar-collapsed") === "true"
  );

  const [lang, setLang] = useState(
    () => localStorage.getItem("shopadmin-language") || "en"
  );

  const t = (value) =>
    translate(lang, value);

  const [mobileOpen, setMobileOpen] = useState(false);

  const [dark, setDark] = useState(
    () => localStorage.getItem("shopadmin-theme") === "dark"
  );

  const [refreshKey, setRefreshKey] = useState(0);

  const activeItem = NAV.find(([id]) => id === active);

  const refresh = () => setRefreshKey((value) => value + 1);

  function navigate(id) {
    setActive(id);
    setMobileOpen(false);
  }

  function toggleCollapsed() {
    setCollapsed((value) => {
      localStorage.setItem(
        "shopadmin-sidebar-collapsed",
        String(!value)
      );
      return !value;
    });
  }

  function changeLanguage(value) {
    setLang(value);
    localStorage.setItem("shopadmin-language", value);
  }

  function toggleTheme() {
    setDark((value) => {
      localStorage.setItem(
        "shopadmin-theme",
        value ? "light" : "dark"
      );
      return !value;
    });
  }

  function reset() {
    if (
      window.confirm(
        t("Reset all local dashboard records to the original sample data?")
      )
    ) {
      resetDemoData();
      refresh();
    }
  }

  return (
    <div
      className={`admin-shell ${dark ? "dark" : ""} ${
        collapsed ? "sidebar-collapsed" : ""
      }`}
      lang={lang === "am" ? "am" : lang === "om" ? "om" : "en"}
    >
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><ShoppingCart size={21} /></div>
          <div className="brand-name">SHOP<span>ADMIN</span></div>
          <button
            className="mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label={t("Close menu")}
          >
            <X />
          </button>
        </div>

        <div className="workspace-label">{t("WORKSPACE")}</div>

        <nav className="side-nav">
          {NAV.map(([id, label, Icon]) => (
            <button
              key={id}
              className={active === id ? "active" : ""}
              onClick={() => navigate(id)}
              title={t(label)}
            >
              <Icon size={18} />
              <span>{t(label)}</span>
              {active === id && <i />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-avatar">WK</div>
          <div className="profile-info">
            <b>{t("Administrator")}</b>
            <span>{t("Frontend-only workspace")}</span>
          </div>
          <button title={t("Reset sample data")} onClick={reset}>
            <RotateCcw size={16} />
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          className="mobile-scrim"
          onClick={() => setMobileOpen(false)}
          aria-label={t("Close menu")}
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-btn menu-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label={t("Open menu")}
            >
              <Menu />
            </button>

            <button
              className="icon-btn desktop-toggle"
              onClick={toggleCollapsed}
              title={t("Toggle sidebar")}
              aria-label={t("Toggle sidebar")}
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </button>

            <div className="breadcrumb">
              {t("WORKSPACE")} <span>/</span>{" "}
              <b>{t(activeItem?.[1] || "Overview")}</b>
            </div>
          </div>

          <div className="topbar-right">
            <span className="local-badge"><i /> {t("Local data")}</span>

            <label className="language-picker" title={t("Language")}>
              <Globe size={16} />
              <select
                aria-label={t("Language")}
                value={lang}
                onChange={(event) => changeLanguage(event.target.value)}
              >
                <option value="en">EN</option>
                <option value="am">አማ</option>
                <option value="om">OR</option>
              </select>
            </label>

            <button
              className="icon-btn"
              title={t("Toggle theme")}
              onClick={toggleTheme}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="top-avatar">WK</div>
          </div>
        </header>

        <div className="page-container">
          {active === "overview" ? (
            <Overview onNavigate={navigate} t={t} />
          ) : active === "analytics" ? (
            <Analytics refreshKey={refreshKey} t={t} />
          ) : active === "settings" ? (
            <SettingsPage
              onReset={reset}
              lang={lang}
              onLanguage={changeLanguage}
              t={t}
            />
          ) : (
            <ModulePage
              module={active}
              refreshKey={refreshKey}
              onRefresh={refresh}
              t={t}
            />
          )}
        </div>

        <footer className="app-footer">
          © 2026 ShopAdmin · {t("Frontend-only workspace")} · {t("Local data storage")}
        </footer>
      </main>
    </div>
  );
}

function Analytics({ refreshKey, t }) {
  const summary = getSummary();

  const data = [
    ["Users", summary.users],
    ["Sellers", summary.sellers],
    ["Products", summary.products],
    ["Orders", summary.orders]
  ];

  const max = Math.max(...data.map((item) => item[1]), 1);

  return (
    <div className="page-stack" key={refreshKey}>
      <div className="page-title">
        <div>
          <span className="eyebrow">{t("INSIGHTS")}</span>
          <h2>{t("Analytics")}</h2>
          <p>{t("Summary of the records currently stored in this browser.")}</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>{t("Platform overview")}</h3>
            <p>{t("Record counts by module")}</p>
          </div>
        </div>

        <div className="bars">
          {data.map(([label, value]) => (
            <div className="bar-row" key={label}>
              <span>{t(label)}</span>
              <div>
                <i style={{ width: `${(value / max) * 100}%` }} />
              </div>
              <b>{value}</b>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SettingsPage({ onReset, lang, onLanguage, t }) {
  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <span className="eyebrow">{t("PREFERENCES")}</span>
          <h2>{t("Settings")}</h2>
          <p>{t("Manage this local frontend workspace.")}</p>
        </div>
      </div>

      <section className="panel settings-panel">
        <div>
          <h3>{t("Local data storage")}</h3>
          <p>{t("Records are saved in this browser using localStorage. They are not sent to a server or shared with other users.")}</p>
        </div>
        <button className="btn btn-light" onClick={onReset}>
          <RotateCcw size={16} /> {t("Reset sample data")}
        </button>
      </section>

      <section className="panel settings-panel">
        <div>
          <h3>{t("Backend integration")}</h3>
          <p>{t("This version intentionally runs without a backend. Your team can connect the API later by replacing the local data layer.")}</p>
        </div>
        <span className="status warning">{t("Not connected")}</span>
      </section>

      <section className="panel settings-panel">
        <div>
          <h3>{t("Language preference")}</h3>
          <p>{t("Choose the language used across the dashboard.")}</p>
        </div>

        <label className="settings-language">
          <Globe size={17} />
          <select
            value={lang}
            onChange={(event) => onLanguage(event.target.value)}
          >
            <option value="en">{t("English")}</option>
            <option value="am">{t("Amharic")}</option>
            <option value="om">{t("Afaan Oromoo")}</option>
          </select>
        </label>
      </section>
    </div>
  );
}
