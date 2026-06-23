export const STATES_AND_CITIES: Record<string, string[]> = {
  Lagos: ['Ikeja','Victoria Island','Lekki','Ajah','Surulere','Yaba','Ikoyi','Apapa','Badagry','Epe','Ikorodu','Mushin','Oshodi','Agege','Alimosho','Festac','Magodo','Ojodu','Ojota','Maryland','Gbagada','Isale-Eko','Bode Thomas','Orile','Amuwo-Odofin'],
  Abuja: ['Maitama','Asokoro','Garki','Wuse','Gwarinpa','Kubwa','Lugbe','Karu','Nyanya','Bwari','Gwagwalada','Lokogoma','Jabi','Utako','Cadastral Zone'],
  Rivers: ['Port Harcourt','Obio-Akpor','Eleme','Okrika','Bonny','Degema','Ahoada','Oyigbo','Omuma','Emohua'],
  Ogun: ['Abeokuta','Sagamu','Ijebu-Ode','Ota','Ilaro','Ifo','Owode','Ewekoro','Odeda'],
  Kano: ['Kano Municipal','Fagge','Dala','Gwale','Tarauni','Nassarawa','Ungogo','Gezawa','Kumbotso'],
  Anambra: ['Awka','Onitsha','Nnewi','Ekwulobia','Ogidi','Agulu','Nkpor','Obosi','Umunya'],
  Oyo: ['Ibadan','Ogbomoso','Oyo','Iseyin','Saki','Eruwa','Igbo-Ora','Fiditi'],
  Kaduna: ['Kaduna','Zaria','Kafanchan','Kagoro','Kachia','Saminaka'],
  Delta: ['Asaba','Warri','Effurun','Sapele','Ughelli','Agbor','Abraka','Burutu'],
  Enugu: ['Enugu','Nsukka','Agbani','Oji River','Awgu','Udi','9th Mile Corner'],
  Imo: ['Owerri','Orlu','Okigwe','Mbaise','Oguta','Nkwerre'],
  Kwara: ['Ilorin','Offa','Omu-Aran','Jebba','Patigi','Kaiama'],
  Osun: ['Osogbo','Ile-Ife','Ilesa','Ede','Iwo','Ejigbo','Ikirun'],
  Ondo: ['Akure','Ondo','Owo','Okitipupa','Ilare','Idanre'],
  Ekiti: ['Ado-Ekiti','Ikere-Ekiti','Ijero-Ekiti','Ise-Ekiti','Efon-Alaaye'],
  'Cross River': ['Calabar','Ogoja','Ikom','Obudu','Ugep','Obubra'],
  'Akwa Ibom': ['Uyo','Eket','Ikot Ekpene','Abak','Oron','Ikot Abasi'],
  Edo: ['Benin City','Auchi','Ekpoma','Uromi','Ubiaja','Sabongida-Ora'],
  Benue: ['Makurdi','Gboko','Otukpo','Katsina-Ala','Vandekya'],
  Plateau: ['Jos','Bukuru','Shendam','Pankshin','Langtang'],
  Bauchi: ['Bauchi','Azare','Misau','Ningi','Jama\'are'],
  Borno: ['Maiduguri','Biu','Gwoza','Dikwa','Monguno'],
  Gombe: ['Gombe','Kumo','Kaltungo','Billiri'],
  Jigawa: ['Dutse','Hadejia','Gumel','Ringim','Kazaure'],
  Kebbi: ['Birnin Kebbi','Argungu','Yauri','Zuru'],
  Kogi: ['Lokoja','Okene','Kabba','Idah','Ankpa'],
  Nasarawa: ['Lafia','Keffi','Akwanga','Nasarawa','Doma'],
  Niger: ['Minna','Suleja','Kontagora','Bida','Lapai'],
  Sokoto: ['Sokoto','Wurno','Gwadabawa','Tambuwal'],
  Taraba: ['Jalingo','Wukari','Bali','Gembu'],
  Yobe: ['Damaturu','Potiskum','Gashua','Nguru'],
  Zamfara: ['Gusau','Kaura-Namoda','Anka','Talata-Mafara'],
  Abia: ['Umuahia','Aba','Arochukwu','Ohafia'],
  Adamawa: ['Yola','Mubi','Numan','Gombi'],
  Bayelsa: ['Yenagoa','Brass','Sagbama','Ogbia'],
  Ebonyi: ['Abakaliki','Afikpo','Onueke','Ezza'],
};

export const ALL_STATES = Object.keys(STATES_AND_CITIES).sort();

export function getCities(state: string): string[] {
  return STATES_AND_CITIES[state] ?? [];
}
