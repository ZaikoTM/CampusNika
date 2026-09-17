// Base de datos de recursos de Cirugía — Campus Nika
const CIRUGIA_RECURSOS = {
  up1: {
    materiales: [
      { title: "Contenidos Oficiales UP1", type: "pdf", url: "https://drive.google.com/file/d/1iEVe8ppkRG7s_v0P229m48xlV0HQPcrE/view?usp=sharing" },
      { title: "Schwartz: Principios de Cirugía (10ª Edición)", type: "pdf", url: "https://drive.google.com/file/d/19wd75GM2M7ycnmiJNqs1g4i3XWh6oBWm/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 1", type: "pdf", url: "https://drive.google.com/file/d/1xgdSPsxN2XoYmiCYiDbjBWrxga8sOVuf/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 2", type: "pdf", url: "https://drive.google.com/file/d/1RLP2myEMWxkiuOX4D3TS2CZIUwIyOaFB/view?usp=sharing" }
    ],
    videos: [
      { title: "Heridas y Suturas (Clase PPT)", type: "video", url: "https://docs.google.com/presentation/d/1J3e_X_x102VgTWDVP3_ItupsSC63-bZn/edit?usp=drive_link&ouid=112463194107707929305&rtpof=true&sd=true" }
    ]
  },
  up2: {
    materiales: [
      { title: "Contenidos Oficiales UP2", type: "apunte", url: "https://docs.google.com/document/d/1ZJ3mosxi5xHwyv9bbyTM82AufgGiAKpC/edit?usp=sharing&ouid=112463194107707929305&rtpof=true&sd=true" },
      { title: "Schwartz: Principios de Cirugía (10ª Edición)", type: "pdf", url: "https://drive.google.com/file/d/19wd75GM2M7ycnmiJNqs1g4i3XWh6oBWm/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 1", type: "pdf", url: "https://drive.google.com/file/d/1xgdSPsxN2XoYmiCYiDbjBWrxga8sOVuf/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 2", type: "pdf", url: "https://drive.google.com/file/d/1RLP2myEMWxkiuOX4D3TS2CZIUwIyOaFB/view?usp=sharing" }
    ],
    videos: [
      { title: "Abdomen Agudo Quirúrgico (Clase PPT)", type: "video", url: "https://docs.google.com/presentation/d/1zAig5GRnZ2KNwsZQk4NnHk07pLXB7duo/edit?usp=sharing&ouid=112463194107707929305&rtpof=true&sd=true" }
    ]
  },
  up3: {
    materiales: [
      { title: "Contenidos Oficiales UP3", type: "apunte", url: "https://docs.google.com/document/d/17Wa-QulgFX6ljfclSXc2ecmUoVgS6vgY/edit?usp=drive_link&ouid=112463194107707929305&rtpof=true&sd=true" },
      { title: "Manometría Esofágica", type: "resumen", url: "https://drive.google.com/file/d/1O6mmumK94iaql1NLfdnVk-XeNawlYfS5/view?usp=sharing" },
      { title: "Schwartz: Principios de Cirugía (10ª Edición)", type: "pdf", url: "https://drive.google.com/file/d/19wd75GM2M7ycnmiJNqs1g4i3XWh6oBWm/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 1", type: "pdf", url: "https://drive.google.com/file/d/1xgdSPsxN2XoYmiCYiDbjBWrxga8sOVuf/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 2", type: "pdf", url: "https://drive.google.com/file/d/1RLP2myEMWxkiuOX4D3TS2CZIUwIyOaFB/view?usp=sharing" }
    ],
    videos: []
  },
  up4: {
    materiales: [
      { title: "Contenidos Oficiales UP4", type: "apunte", url: "https://docs.google.com/document/d/1d0DsRnvo2N76uOUaKVnaqk8Mb9sjwCfY/edit?usp=sharing&ouid=112463194107707929305&rtpof=true&sd=true" },
      { title: "Schwartz: Principios de Cirugía (10ª Edición)", type: "pdf", url: "https://drive.google.com/file/d/19wd75GM2M7ycnmiJNqs1g4i3XWh6oBWm/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 1", type: "pdf", url: "https://drive.google.com/file/d/1xgdSPsxN2XoYmiCYiDbjBWrxga8sOVuf/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 2", type: "pdf", url: "https://drive.google.com/file/d/1RLP2myEMWxkiuOX4D3TS2CZIUwIyOaFB/view?usp=sharing" }
    ],
    videos: [
      { title: "Cáncer Colorrectal (CCR) — Pedroni (PPT)", type: "video", url: "https://drive.google.com/file/d/1EndWI7nYyp_Py_po7gf2SBTIQNNBtykE/view?usp=sharing" },
      { title: "Divertículos de Colon (PPT)", type: "video", url: "https://drive.google.com/file/d/17tFVwcuGesMGz3tCs9XALRzEr6-PuU7r/view?usp=sharing" },
      { title: "Enfermedades de Colon, Ano y Recto (PPT)", type: "video", url: "https://drive.google.com/file/d/1-LlcY1T6513tChgcI0QOHSbM-4b-SwO5/view?usp=sharing" },
      { title: "Pancreatitis Aguda y Crónica (PPT)", type: "video", url: "https://docs.google.com/presentation/d/1zvYLazSYfOeXhpAdFKADDhx_ryrpsd5_/edit?usp=sharing&ouid=112463194107707929305&rtpof=true&sd=true" }
    ]
  },
  up5: {
    materiales: [
      { title: "Contenidos Oficiales UP5", type: "apunte", url: "https://docs.google.com/document/d/104x1oESw79QW4F6aRsZx0-l1wfe11ANu/edit?usp=sharing&ouid=112463194107707929305&rtpof=true&sd=true" },
      { title: "Comunicar Malas Noticias — Protocolo Buckman", type: "pdf", url: "https://drive.google.com/file/d/1_zKKQUKcXI7j5da4BDPhILnQYy7UjG-s/view?usp=sharing" },
      { title: "Pancreatitis — Guía de Abordaje", type: "pdf", url: "https://drive.google.com/file/d/1yatJhxdngDGOrEqzNJ_ryuD_hri04ZPe/view?usp=sharing" },
      { title: "Schwartz: Principios de Cirugía (10ª Edición)", type: "pdf", url: "https://drive.google.com/file/d/19wd75GM2M7ycnmiJNqs1g4i3XWh6oBWm/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 1", type: "pdf", url: "https://drive.google.com/file/d/1xgdSPsxN2XoYmiCYiDbjBWrxga8sOVuf/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 2", type: "pdf", url: "https://drive.google.com/file/d/1RLP2myEMWxkiuOX4D3TS2CZIUwIyOaFB/view?usp=sharing" }
    ],
    videos: [
      { title: "Patología Hepatobiliar (Clase PPT)", type: "video", url: "https://docs.google.com/presentation/d/19B3s7RO0_xJg5R39giNHjpffKQC0wQek/edit?usp=sharing&ouid=112463194107707929305&rtpof=true&sd=true" }
    ]
  },
  up6: {
    materiales: [
      { title: "Contenidos Oficiales UP6", type: "apunte", url: "https://docs.google.com/document/d/1VliZhv981cT4aqk_P87SaW1onDcoWykn/edit?usp=sharing&ouid=112463194107707929305&rtpof=true&sd=true" },
      { title: "Síndromes Clínico-Quirúrgicos Abdominales y Radiológicos", type: "pdf", url: "https://drive.google.com/file/d/1dXDSeTypjGGGYjEicP3EBfQIUyN9-UZC/view?usp=sharing" },
      { title: "Schwartz: Principios de Cirugía (10ª Edición)", type: "pdf", url: "https://drive.google.com/file/d/19wd75GM2M7ycnmiJNqs1g4i3XWh6oBWm/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 1", type: "pdf", url: "https://drive.google.com/file/d/1xgdSPsxN2XoYmiCYiDbjBWrxga8sOVuf/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 2", type: "pdf", url: "https://drive.google.com/file/d/1RLP2myEMWxkiuOX4D3TS2CZIUwIyOaFB/view?usp=sharing" }
    ],
    videos: [
      { title: "Accesos Venosos Centrales (Clase Teórica)", type: "video", url: "https://drive.google.com/file/d/1-R_knBewvd3f6hX2GYZ1SCPZKcnwpwOZ/view?usp=sharing" }
    ]
  },
  up7: {
    materiales: [
      { title: "Contenidos Oficiales UP7", type: "apunte", url: "https://docs.google.com/document/d/1cGCXOh6TGGFtIaconEZqOCq60zXO7XK-/edit?usp=sharing&ouid=112463194107707929305&rtpof=true&sd=true" },
      { title: "Schwartz: Principios de Cirugía (10ª Edición)", type: "pdf", url: "https://drive.google.com/file/d/19wd75GM2M7ycnmiJNqs1g4i3XWh6oBWm/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 1", type: "pdf", url: "https://drive.google.com/file/d/1xgdSPsxN2XoYmiCYiDbjBWrxga8sOVuf/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 2", type: "pdf", url: "https://drive.google.com/file/d/1RLP2myEMWxkiuOX4D3TS2CZIUwIyOaFB/view?usp=sharing" }
    ],
    videos: []
  },
  up8: {
    materiales: [
      { title: "Contenidos Oficiales UP8", type: "apunte", url: "https://docs.google.com/document/d/16aetRJP5TpLg7ItguylaYFgcLLWndETB/edit?usp=sharing&ouid=112463194107707929305&rtpof=true&sd=true" },
      { title: "Comunicación en Situaciones Críticas", type: "pdf", url: "https://drive.google.com/file/d/1ry_8bt7bUBSyD1WiXiTKxgEcX7I7EH-y/view?usp=sharing" },
      { title: "Schwartz: Principios de Cirugía (10ª Edición)", type: "pdf", url: "https://drive.google.com/file/d/19wd75GM2M7ycnmiJNqs1g4i3XWh6oBWm/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 1", type: "pdf", url: "https://drive.google.com/file/d/1xgdSPsxN2XoYmiCYiDbjBWrxga8sOVuf/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 2", type: "pdf", url: "https://drive.google.com/file/d/1RLP2myEMWxkiuOX4D3TS2CZIUwIyOaFB/view?usp=sharing" }
    ],
    videos: []
  },
  up9: {
    materiales: [
      { title: "Contenidos Oficiales UP9", type: "apunte", url: "https://docs.google.com/document/d/1wQ_Yh47gjuRxKEuWfWSy4EsXnD5-AM48/edit?usp=sharing&ouid=112463194107707929305&rtpof=true&sd=true" },
      { title: "Schwartz: Principios de Cirugía (10ª Edición)", type: "pdf", url: "https://drive.google.com/file/d/19wd75GM2M7ycnmiJNqs1g4i3XWh6oBWm/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 1", type: "pdf", url: "https://drive.google.com/file/d/1xgdSPsxN2XoYmiCYiDbjBWrxga8sOVuf/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 2", type: "pdf", url: "https://drive.google.com/file/d/1RLP2myEMWxkiuOX4D3TS2CZIUwIyOaFB/view?usp=sharing" }
    ],
    videos: [
      { title: "Trabajo Práctico UP9 (Presentación PPT)", type: "video", url: "https://docs.google.com/presentation/d/1vmwnQ_u_6p-CBJ13WxnqFAhP0ho5yQY3/edit?usp=sharing&ouid=112463194107707929305&rtpof=true&sd=true" }
    ]
  },
  up10: {
    materiales: [
      { title: "Contenidos Oficiales UP10", type: "apunte", url: "https://docs.google.com/document/d/1SbN6xFmVGd-jJ84VIy3VdcLaGaSr1FFs/edit?usp=drive_link&ouid=112463194107707929305&rtpof=true&sd=true" },
      { title: "Schwartz: Principios de Cirugía (10ª Edición)", type: "pdf", url: "https://drive.google.com/file/d/19wd75GM2M7ycnmiJNqs1g4i3XWh6oBWm/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 1", type: "pdf", url: "https://drive.google.com/file/d/1xgdSPsxN2XoYmiCYiDbjBWrxga8sOVuf/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 2", type: "pdf", url: "https://drive.google.com/file/d/1RLP2myEMWxkiuOX4D3TS2CZIUwIyOaFB/view?usp=sharing" }
    ],
    videos: []
  },
  up11: {
    materiales: [
      { title: "Contenidos Oficiales UP11", type: "apunte", url: "https://docs.google.com/document/d/1b4B1HV8grV8gNf0P5J_n3yHZgxpKC4Or/edit?usp=drive_link&ouid=112463194107707929305&rtpof=true&sd=true" },
      { title: "Enfermedades de Colon, Ano y Recto — Parte 1", type: "pdf", url: "https://drive.google.com/file/d/16sFGdg4xZAeO47UxIyiscHIcVnUHBUNh/view?usp=sharing" },
      { title: "Enfermedades de Colon, Ano y Recto — Parte 2", type: "pdf", url: "https://drive.google.com/file/d/1AqPmW6-gpLP-JzIzSMFdavtl9HxnFPR6/view?usp=sharing" },
      { title: "Schwartz: Principios de Cirugía (10ª Edición)", type: "pdf", url: "https://drive.google.com/file/d/19wd75GM2M7ycnmiJNqs1g4i3XWh6oBWm/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 1", type: "pdf", url: "https://drive.google.com/file/d/1xgdSPsxN2XoYmiCYiDbjBWrxga8sOVuf/view?usp=sharing" },
      { title: "Michans: Cirugía — Parte 2", type: "pdf", url: "https://drive.google.com/file/d/1RLP2myEMWxkiuOX4D3TS2CZIUwIyOaFB/view?usp=sharing" }
    ],
    videos: []
  }
};