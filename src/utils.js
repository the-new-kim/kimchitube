// const removeLikeUser = (model, user, likeOrDislike) => {
//   const newLikeUsers = model.meta[likeOrDislike].filter(
//     (likeOrDislikeUser) => likeOrDislikeUser + "" !== user._id + ""
//   );
//   model.meta[likeOrDislike] = newLikeUsers;
// };

// export const likeTargetModel = (model, user, isLikeHit) => {
//   /////// capsulate from here
//   const isAlreadyLiked = model.meta.likeUsers.includes(user._id);
//   const isAlreadyDisiked = model.meta.dislikeUsers.includes(user._id);

//   if (isLikeHit) {
//     if (isAlreadyLiked) {
//       removeLikeUser(model, user, "likeUsers");
//     } else {
//       if (isAlreadyDisiked) {
//         removeLikeUser(model, user, "dislikeUsers");
//       }
//       model.meta.likeUsers.push(user._id);
//     }
//   } else {
//     if (isAlreadyDisiked) {
//       removeLikeUser(model, user, "dislikeUsers");
//     } else {
//       if (isAlreadyLiked) {
//         removeLikeUser(model, user, "likeUsers");
//       }

//       model.meta.dislikeUsers.push(user._id);
//     }
//   }

//   model.save();

//   return {
//     result: {
//       likes: model.meta.likeUsers.length,
//       userLikesTarget: model.meta.likeUsers.includes(user._id),
//       dislikes: model.meta.dislikeUsers.length,
//       userDislikesTarget: model.meta.dislikeUsers.includes(user._id),
//     },
//   };
// };
