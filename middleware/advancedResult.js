const advancedResult = (model, populate) => async (req, res, next) => {
  let query;

  //copy req.query
  const reqQuery = { ...req.query };

  const removefields = ['select', 'sort', 'limit', 'page'];

  removefields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(req.query);

  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  query = model.find(JSON.parse(queryStr));

  //select feilds
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  //pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(endIndex);

  if (populate) {
    query = query.populate(populate);
  }

  const result = await query;
  res.advancedResult = {
    sccess: true,
    count: result.lenght,
    data: result,
  };
  next();
};

module.exports = advancedResult;
