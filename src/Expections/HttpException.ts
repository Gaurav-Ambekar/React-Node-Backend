interface HttpException extends Error {
  status: number;
}

export default HttpException;
