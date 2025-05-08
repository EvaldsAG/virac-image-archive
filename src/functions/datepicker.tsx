// import { useEffect, useRef } from 'react';
// import AirDatepicker from 'air-datepicker';
// import localeEn from 'air-datepicker/locale/en';
// import 'air-datepicker/air-datepicker.css';

// export default function Datepicker() {
//     const inputRef = useRef(null);


//     useEffect(() => {
//         if (!inputRef.current) return;


//         const picker = new AirDatepicker(inputRef.current, { inline: true, locale: localeEn });


//         return () => picker.destroy();
//     }, []);


//     return <input ref={inputRef} type="text" />;
// }
