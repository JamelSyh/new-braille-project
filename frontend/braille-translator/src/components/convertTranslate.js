import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux/es/hooks/useDispatch";
import { useSelector } from "react-redux/es/hooks/useSelector";
import { inputTransOptions, outputTransOptions, inputTransLang, outputTransLang, inputText, outputText, pending } from "../redux/actions";


function ConvertTranslate() {

  const dispatch = useDispatch();
  const inText = useSelector(state => state.text.inputText);
  const outText = useSelector(state => state.text.outputText);
  const inLang = useSelector(state => state.language.inLang);
  const inTrans = useSelector(state => state.language.inTrans);
  const outTrans = useSelector(state => state.language.outTrans);
  const url = "https://braille-1-d9412035.deta.app";

  const [debouncedText, setDebouncedText] = useState(inText);

  useEffect(() => {

    dispatch(pending(true));
    const timer = setTimeout(() => {
      setDebouncedText(inText);
    }, 500);
    return () => { clearTimeout(timer); };
  }, [inText, inTrans, dispatch]);


  useEffect(() => {
    const getOptions = async () => {
      const { data } = await axios.get(`${url}/translate_options`, {}, {
      });
      if (data) {
        dispatch(inputTransOptions(data));
        dispatch(outputTransOptions(data));
        dispatch(inputTransLang(data[0]));
        dispatch(outputTransLang(data[1]));

        if (inLang.code !== "1" && inLang.code !== "2") {
          dispatch(inputText(outText));
        } else {
          dispatch(inputText(inText));
        }
      }
    };
    getOptions();
  }, [dispatch]);


  useEffect(() => {
    const Transcoding = async () => {
      const { data } = await axios.post(`${url}/translator`, {}, {
        params: {
          text: debouncedText,
          source_lang: inTrans[0].code,
          source_grade: inTrans[0].grade.code,
          target_lang: outTrans[0].code,
          target_grade: outTrans[0].grade.code
        }
      });
      if (data) {
        if (debouncedText !== "" && data.result)
          dispatch(outputText(data.result));
        else
          dispatch(outputText(""));

      }
      if (debouncedText === "")
        dispatch(outputText(""));

      dispatch(pending(false));
    };
    Transcoding();
  }, [debouncedText, inText, inTrans, outTrans, dispatch]);
}

export default ConvertTranslate;
