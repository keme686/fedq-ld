package fr.inria.wimmics.query.dqp.server;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.RDFNode;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.rdf.model.StmtIterator;
import com.hp.hpl.jena.sparql.core.ResultBinding;

import fr.inria.wimmics.common.utils.LoggerLocal;
import fr.inria.wimmics.query.dqp.Environment;
import fr.inria.wimmics.query.dqp.JenaFederatedQueryProcessor;
import fr.inria.wimmics.query.explanation.JenaExplanationUtils;
import fr.inria.wimmics.query.explanation.QueryResultExplainer;

@SuppressWarnings("serial")
public class ExplainResultServlet extends HttpServlet {
	Logger log = LoggerLocal.getLogger(ExplainResultServlet.class.getName());
	
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	process(request,response);
    }
    
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		process(request,response);
		
	}
	
	private void process(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		Environment env = ServerUtils.getEnvironmentAttribute(request);
		//request.getParameterMap();
		//log.info(Arrays.toString(request.getParameterMap().entrySet().toArray()));
		String result = request.getParameter("result");
		JenaFederatedQueryProcessor queryProcessor = ServerUtils.getJenaQueryProcessorAttribute(request, env);
		
		log.info("Received result:"+result);
		
		Gson gson=new Gson();
		Type type = new TypeToken<Map<String, String>>(){}.getType();
		Map<String, String> solnMap = gson.fromJson(result, type);
		
		ResultBinding soln = JenaExplanationUtils.convertToResultBinding(queryProcessor.getVirtualModel(), solnMap);
		log.info("Solution:"+soln);
		//QueryResultExplainer.explainQueryResult(queryProcessor.getVirtualModel(), queryProcessor.getQuery(), soln);
		response.setStatus(HttpServletResponse.SC_OK);
		
		try{
		Model model = QueryResultExplainer.explainQueryResult(queryProcessor.getVirtualModel(), queryProcessor.getQuery(), soln);
		
		
	/*	JsonArray res = new JsonArray();
		StmtIterator iter = model.listStatements();
		while (iter.hasNext()) {
			Statement stmt = iter.nextStatement(); // get next statement
			Resource subject = stmt.getSubject(); // get the subject
			Property predicate = stmt.getPredicate(); // get the predicate
			RDFNode object = stmt.getObject(); // get the object
			JsonObject r = new  JsonObject();
			r.addProperty("subject", subject.toString());
			r.addProperty("predicate", predicate.toString());
			r.addProperty("object", object.toString());
			System.out.println("Iterating: "+subject.toString());
			res.add(r);
		}
		System.out.println("RDF/Json result:  "+res);
		response.getOutputStream().println(new Gson().toJson(res));
		*/
		JsonArray resArray = new JsonArray();
		JsonArray a = new JsonArray();
		JsonObject triples = new JsonObject();
		StmtIterator iter = model.listStatements();
		int i=0;
		while(iter.hasNext()){
			
			Statement stmt = iter.nextStatement();
			Resource subject = stmt.getSubject();
			Resource pred = stmt.getPredicate();
			RDFNode obj = stmt.getObject();
			
			JsonObject jobj= new JsonObject();
			jobj.addProperty("subject", subject.toString());
			jobj.addProperty("predicate", pred.toString());
			jobj.addProperty("object", obj.toString());
			
			a.add(jobj);
			
			
		}
		triples.add("triples", a);
		triples.addProperty("source", "source A");

		resArray.add(triples);
		System.out.println("JSON result: " + resArray);
		System.out.println("RDF/JSON: ");
		model.write(System.out, "RDF/JSON");
		response.getOutputStream().println(new Gson().toJson(resArray));
		
		}catch(Exception e){
			e.printStackTrace();
		}
		
		
	}
	
}
