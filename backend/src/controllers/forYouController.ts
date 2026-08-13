import type { RequestHandler } from "express";

import { Recipe } from "../models/recipe.js";
import { User } from "../models/user.js";

export const getForYouRecipes: RequestHandler = async (request, response) => {
  const user =
    request.user?.role === "user"
      ? await User.findById(request.user.id).select("preferences").lean()
      : null;

  if (user?.preferences.length) {
    const recipes = await Recipe.find({ categories: { $in: user.preferences } })
      .select("title image totalTime likeCount categories createdAt author")
      .populate({ path: "author", select: "fullName image username" })
      .sort({ createdAt: -1 })
      .limit(8);
    response.status(200).json({ recipes });
    return;
  }

  const recipes = await Recipe.aggregate([
    { $sample: { size: 8 } },
    {
      $lookup: {
        from: User.collection.name,
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    { $unwind: "$author" },
    {
      $project: {
        title: 1,
        image: 1,
        totalTime: 1,
        likeCount: 1,
        categories: 1,
        createdAt: 1,
        "author._id": 1,
        "author.username": 1,
        "author.fullName": 1,
        "author.image": 1,
      },
    },
  ]);
  response.status(200).json({ recipes });
};
