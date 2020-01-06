import request from "request";

/**
 * Perform a HTTP DELETE request on a url and get a JSON body, if any.
 * @param {string} url the url to DELETE.
 * @returns {Promise<any>}
 */
const del = (url) => {
  return new Promise((resolve, reject) => {
    request({
      url,
      method: "DELETE"
    }, (err, _, body) => {
      if (err) reject(err);
      else resolve((body) ? JSON.stringify(body) : {});
    });
  });
}

/**
 * Perform a HTTP GET request on a url and get a JSON body, if any.
 * @param {string} url the url to GET.
 * @returns {Promise<any>}
 */
const get = (url) => {
  return new Promise((resolve, reject) => {
    request({
      url,
      method: "GET"
    }, (err, _, body) => {
      if (err) reject(err);
      else resolve(JSON.stringify(body));
    });
  })
};

/**
 * Perform a HTTP POST request on a url with an optional POST body.
 * @param {string} url the url.
 * @param {any} data the data
 * @returns {Promise<any>}
 */
const post = (url, data) => {
  return new Promise((resolve, reject) => {
    let body = data;
    if (typeof body === "object") { body = JSON.stringify(body); }
    request({
      url,
      method: "POST",
      body
    }, (err, _, body) => {
      if (err) reject(err);
      else resolve(JSON.stringify(body));
    })
  });
}

/**
 * Perform a HTTP PUT request on a URL with an optional PUT body.
 * @param {string} url the url.
 * @param {any} data the body.
 */
const put = (url, data) => {
  return new Promise((resolve, reject) => {
    let body = data;
    if (typeof body === "object") body = JSON.stringify(body);
    request({
      url,
      method: "PUT",
      body
    }, (err, _, body) => {
      if (err) reject(err);
      else resolve(body);
    })
  });
}

export {
  del,
  get,
  post,
  put
};
