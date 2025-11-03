const fs = require('fs/promises');
const path = require('path');
const { getFromCache, setInCache } = require('./cacheService');

// Define the path to the JSON data file
const dataPath = path.join(__dirname, '..', 'Data');

/**
 * Reads and parses a JSON file from the Data directory.
 * @param {string} fileName - The path to the file relative to the Data directory.
 * @returns {Promise<any>} The parsed JSON data.
 */
const readJsonFile = async (fileName) => {
  const filePath = path.join(dataPath, fileName);
  const fileData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(fileData);
};

// Helper function to filter vehicle data based on query parameters
const filterVehicleData = (vehicleBrands, query) => {
  let results = { ...vehicleBrands }
  const { type, brand, trim, fuel_type } = query

  if (type) {
    const formattedType =
      type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
    // Return only the specified type, or an empty object if not found
    results = results[formattedType]
      ? { [formattedType]: results[formattedType] }
      : {}
  }

  if (brand) {
    for (const vehicleType in results) {
      results[vehicleType] = results[vehicleType].filter(
        (b) => b.brand.toLowerCase() === brand.toLowerCase()
      )
    }
  }

  if (trim) {
    const lowerCaseTrim = trim.toLowerCase();
    for (const vehicleType in results) {
      // Map over each brand to filter its trims
      results[vehicleType] = results[vehicleType]
        .map((brandData) => {
          const filteredTrims = brandData.trims.filter((trim) =>
            trim.name.toLowerCase() === lowerCaseTrim
            //((ft) ==> ft.toLowerCase() === lowerCaseTrim)
          );
          // Return a new brand object with only the matching trims
          return { ...brandData, trims: filteredTrims };
        })
        .filter((brandData) => brandData.trims.length > 0); // Remove brands that have no trims left after filtering
    }
  }

  if (fuel_type) {
    const lowerCaseFuelType = fuel_type.toLowerCase();
    for (const vehicleType in results) {
      // Map over each brand to filter its trims
      results[vehicleType] = results[vehicleType]
        .map((brandData) => {
          const filteredTrims = brandData.trims.filter((trim) =>
            trim.fuel_types.some((ft) => ft.toLowerCase() === lowerCaseFuelType)
          );
          // Return a new brand object with only the matching trims
          return { ...brandData, trims: filteredTrims };
        })
        .filter((brandData) => brandData.trims.length > 0); // Remove brands that have no trims left after filtering
    }
  }
  return results
}

/**
 * Groups oil products by viscosity grade for efficient lookups.
 * @param {Array<object>} oilProducts - The list of oil products.
 * @returns {Map<string, Array<object>>} A map with viscosity as key and products array as value.
 */
const groupOilsByViscosity = (oilProducts) => {
  return oilProducts.reduce((acc, product) => {
    const { viscosityGrade } = product;
    if (!acc.has(viscosityGrade)) {
      acc.set(viscosityGrade, []);
    }
    acc.get(viscosityGrade).push(product);
    return acc;
  }, new Map());
};

/**
 * Groups matching products by category and name, collecting unique stores.
 * @param {Array<object>} matchingProducts - Products that match a trim's viscosity.
 * @returns {object} A structured object of recommended oils.
 */
const groupRecommendedOils = (matchingProducts) => {
  const recommendedOils = matchingProducts.reduce((acc, product) => {
    const { productCategory, productName, stores } = product;
    if (!acc[productCategory]) {
      acc[productCategory] = {};
    }
    if (!acc[productCategory][productName]) {
      acc[productCategory][productName] = new Set();
    }
    acc[productCategory][productName].add(stores);
    return acc;
  }, {});

  // Convert Sets to Arrays for the final JSON output.
  Object.keys(recommendedOils).forEach(category => {
    Object.keys(recommendedOils[category]).forEach(name => {
      recommendedOils[category][name] = Array.from(recommendedOils[category][name]);
    });
  });

  return recommendedOils;
};

// Helper function to enrich vehicle data with oil recommendations
const enrichWithOils = async (vehicleBrands, region, country) => {
  // console.log('Enriching with oils for region:', region);

  const allOilProducts = await getRegionwiseOilData(region, country) || [];
  const oilProductsByViscosity = groupOilsByViscosity(allOilProducts);

  // console.log('Oil products by viscosity:', oilProductsByViscosity);

  //  console.log("vehicleBrands:", JSON.stringify(vehicleBrands));

  // Deep clone to avoid mutating the original vehicle data.
  const enrichedData = JSON.parse(JSON.stringify(vehicleBrands));

  for (const type in enrichedData) {
    enrichedData[type].forEach((brand) => {
      brand.trims.forEach((trim) => {
        // The engine property is now a consistent object.
        if (trim.engine && trim.engine.preffered_engine_oil) {
          const viscosity = trim.engine.preffered_engine_oil;
          //  console.log('Viscosity:', viscosity)
          const matchingProducts = oilProductsByViscosity.get(viscosity) || [];
          //  console.log('Matching products:', JSON.stringify(matchingProducts));

          // Add recommended oils to the engine object.
          if (matchingProducts.length > 0) {
            trim.engine.recommended_oils = groupRecommendedOils(matchingProducts);
          }
        }
      });
    });
  }
  return enrichedData;
};

const getRegionwiseOilData = async (region, country) => {
  // 1. Check cache first
  const cachedData = getFromCache(region);
  if (cachedData) {
    console.log(`✅ Serving oil data for '${region}' from cache.`);
    return cachedData;
  }

  console.log(`Cache miss for '${region}'. Reading from filesystem.`);
  const directoryPath = path.resolve(__dirname, '..', 'Data', region);
  console.log('Reading oil data from directory:', directoryPath);

  try {
    const files = await fs.readdir(directoryPath);
    const oilFiles = files.filter(file => file.startsWith('oil-') && file.endsWith('.json'));
    console.log('Oil files found:', oilFiles);

    // If a country is provided, filter oil data based on the country
    const filteredOilFiles = country ? oilFiles.filter(file => file.includes(country)) : oilFiles;

    const oilProductsPromises = filteredOilFiles.map(file => {
      console.log('Found oil file:', file);
      return readJsonFile(`${region}/${file}`);
    });

    const oilProducts = (await Promise.all(oilProductsPromises)).flatMap(oilData => oilData.products);

    // 2. Store the result in the cache for future requests
    setInCache(region, oilProducts);
    console.log(`✅ Oil data for '${region}' loaded and cached.`);

    return oilProducts;
  } catch (err) {
    console.error('❌ Error reading oil data:', err);
    return [];
  }
};

module.exports = {
  readJsonFile,
  filterVehicleData,
  enrichWithOils,
  getRegionwiseOilData, // Exporting for potential direct use or testing
};
