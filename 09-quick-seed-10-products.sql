-- One-shot insert of 10 products using newest auth user as seller
-- Run this once in your Supabase SQL Editor (same project as your app).
-- This matches the style you used for 'Test Product A' and assigns REAL image URLs.

DO $$
DECLARE
  seller_uuid UUID;
BEGIN
  SELECT id INTO seller_uuid FROM auth.users ORDER BY created_at DESC LIMIT 1;
  IF seller_uuid IS NULL THEN
    RAISE EXCEPTION 'No users found';
  END IF;

  -- 1
  INSERT INTO public.products (seller_id, title, description, category, condition, price, zetta_price, images, status, warranty_duration)
  VALUES (
    seller_uuid,
    'Siemens MAGNETOM Altea 1.5T MRI Scanner',
    'High-performance 1.5T MRI system with Tim 4G technology and Dot engine. Excellent image quality with reduced scan times. Includes complete coil set and advanced imaging applications. Service history available.',
    'Imaging Equipment',
    'excellent',
    850000.00,
    799000.00,
    ARRAY[
      'https://picsum.photos/seed/siemens-magnetom-altea-15t-mri-scanner-1/1200/800',
      'https://picsum.photos/seed/siemens-magnetom-altea-15t-mri-scanner-2/1200/800',
      'https://picsum.photos/seed/siemens-magnetom-altea-15t-mri-scanner-3/1200/800'
    ],
    'available',
    12
  );

  -- 2
  INSERT INTO public.products (seller_id, title, description, category, condition, price, zetta_price, images, status, warranty_duration)
  VALUES (
    seller_uuid,
    'GE Voluson E10 Ultrasound System',
    'Premium women''s health ultrasound system with HDlive technology. Includes 4D imaging capabilities, multiple transducers, and advanced cardiovascular package. Recently serviced with warranty.',
    'Imaging Equipment',
    'excellent',
    125000.00,
    118000.00,
    ARRAY[
      'https://picsum.photos/seed/ge-voluson-e10-ultrasound-system-1/1200/800',
      'https://picsum.photos/seed/ge-voluson-e10-ultrasound-system-2/1200/800',
      'https://picsum.photos/seed/ge-voluson-e10-ultrasound-system-3/1200/800'
    ],
    'available',
    6
  );

  -- 3
  INSERT INTO public.products (seller_id, title, description, category, condition, price, zetta_price, images, status, warranty_duration)
  VALUES (
    seller_uuid,
    'Philips IntelliVue MX450 Patient Monitor',
    'Versatile bedside patient monitor with 12" touchscreen display. Includes ECG, SpO2, NIBP, temperature, and CO2 monitoring capabilities. Portable design with built-in battery.',
    'Patient Monitoring',
    'good',
    8500.00,
    7900.00,
    ARRAY[
      'https://picsum.photos/seed/philips-intellivue-mx450-patient-monitor-1/1200/800',
      'https://picsum.photos/seed/philips-intellivue-mx450-patient-monitor-2/1200/800',
      'https://picsum.photos/seed/philips-intellivue-mx450-patient-monitor-3/1200/800'
    ],
    'available',
    3
  );

  -- 4
  INSERT INTO public.products (seller_id, title, description, category, condition, price, zetta_price, images, status, warranty_duration)
  VALUES (
    seller_uuid,
    'Dräger Evita V500 Ventilator',
    'Advanced ICU ventilator with comprehensive ventilation modes including NIV and neonatal capabilities. Touch screen interface, low flow oxygen therapy, and integrated nebulizer.',
    'Respiratory Equipment',
    'excellent',
    45000.00,
    42000.00,
    ARRAY[
      'https://picsum.photos/seed/draeger-evita-v500-ventilator-1/1200/800',
      'https://picsum.photos/seed/draeger-evita-v500-ventilator-2/1200/800',
      'https://picsum.photos/seed/draeger-evita-v500-ventilator-3/1200/800'
    ],
    'available',
    12
  );

  -- 5
  INSERT INTO public.products (seller_id, title, description, category, condition, price, zetta_price, images, status, warranty_duration)
  VALUES (
    seller_uuid,
    'Maquet Alphamaxx Surgical Table',
    'Universal operating table with carbon fiber tabletop. Full electric positioning, 360° rotation, memory positions, and complete accessory set included.',
    'Surgical Equipment',
    'good',
    35000.00,
    32000.00,
    ARRAY[
      'https://picsum.photos/seed/maquet-alphamaxx-surgical-table-1/1200/800',
      'https://picsum.photos/seed/maquet-alphamaxx-surgical-table-2/1200/800',
      'https://picsum.photos/seed/maquet-alphamaxx-surgical-table-3/1200/800'
    ],
    'available',
    6
  );

  -- 6
  INSERT INTO public.products (seller_id, title, description, category, condition, price, zetta_price, images, status, warranty_duration)
  VALUES (
    seller_uuid,
    'ZOLL R Series Defibrillator',
    'Professional defibrillator with AED mode, pacing, and monitoring capabilities. Includes paddles, pads, batteries, and carrying case. CPR feedback technology.',
    'Emergency Equipment',
    'excellent',
    12000.00,
    11200.00,
    ARRAY[
      'https://picsum.photos/seed/zoll-r-series-defibrillator-1/1200/800',
      'https://picsum.photos/seed/zoll-r-series-defibrillator-2/1200/800',
      'https://picsum.photos/seed/zoll-r-series-defibrillator-3/1200/800'
    ],
    'available',
    3
  );

  -- 7
  INSERT INTO public.products (seller_id, title, description, category, condition, price, zetta_price, images, status, warranty_duration)
  VALUES (
    seller_uuid,
    'Tuttnauer 3870EA Autoclave',
    'Large capacity electronic autoclave (85L). Pre-programmed cycles, automatic door, printer, and drying capabilities. Perfect for hospital central sterile departments.',
    'Sterilization Equipment',
    'fair',
    18000.00,
    16500.00,
    ARRAY[
      'https://picsum.photos/seed/tuttnauer-3870ea-autoclave-1/1200/800',
      'https://picsum.photos/seed/tuttnauer-3870ea-autoclave-2/1200/800',
      'https://picsum.photos/seed/tuttnauer-3870ea-autoclave-3/1200/800'
    ],
    'available',
    6
  );

  -- 8
  INSERT INTO public.products (seller_id, title, description, category, condition, price, zetta_price, images, status, warranty_duration)
  VALUES (
    seller_uuid,
    'Mortara ELI 350 ECG Machine',
    '12-lead resting ECG with interpretation software. Wireless connectivity, EMR integration, and high-resolution color display. Includes cart and supplies.',
    'Diagnostic Equipment',
    'excellent',
    4500.00,
    4200.00,
    ARRAY[
      'https://picsum.photos/seed/mortara-eli-350-ecg-machine-1/1200/800',
      'https://picsum.photos/seed/mortara-eli-350-ecg-machine-2/1200/800',
      'https://picsum.photos/seed/mortara-eli-350-ecg-machine-3/1200/800'
    ],
    'available',
    3
  );

  -- 9
  INSERT INTO public.products (seller_id, title, description, category, condition, price, zetta_price, images, status, warranty_duration)
  VALUES (
    seller_uuid,
    'B. Braun Infusomat Space Infusion Pump',
    'Volumetric infusion pump with drug library and dose error reduction system. Battery operation up to 4 hours, SpaceStation compatible.',
    'Infusion Equipment',
    'good',
    2800.00,
    2600.00,
    ARRAY[
      'https://picsum.photos/seed/b-braun-infusomat-space-infusion-pump-1/1200/800',
      'https://picsum.photos/seed/b-braun-infusomat-space-infusion-pump-2/1200/800',
      'https://picsum.photos/seed/b-braun-infusomat-space-infusion-pump-3/1200/800'
    ],
    'available',
    3
  );

  -- 10
  INSERT INTO public.products (seller_id, title, description, category, condition, price, zetta_price, images, status, warranty_duration)
  VALUES (
    seller_uuid,
    'Canon CXDI-410C Wireless DR Panel',
    'Portable wireless digital radiography detector. 14"x17" active area, cesium iodide scintillator, lightweight design. Compatible with most X-ray systems.',
    'Imaging Equipment',
    'good',
    65000.00,
    61000.00,
    ARRAY[
      'https://picsum.photos/seed/canon-cxdi-410c-wireless-dr-panel-1/1200/800',
      'https://picsum.photos/seed/canon-cxdi-410c-wireless-dr-panel-2/1200/800',
      'https://picsum.photos/seed/canon-cxdi-410c-wireless-dr-panel-3/1200/800'
    ],
    'available',
    12
  );
END $$;

-- Verify last 10 rows
SELECT id, title, status, images[1] AS primary_image
FROM public.products
ORDER BY created_at DESC
LIMIT 10;